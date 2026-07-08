import { expect, type Page } from '@playwright/test';

/**
 * YouTube ToS — Required Minimum Functionality: 임베드 플레이어 viewport ≥200×200 (issue #420).
 * 과거 80×45 "Mode B" 축소는 정책 위반이라 제거됨. 모바일 전체너비 16:9 가 유일한 컴플라이언트 크기.
 */
export const MIN_PLAYER_VIEWPORT_PX = 200;

/** 케이스마다 고유한 partyroom / playlist 이름. e2e-a 패턴 (Date.now().toString(36)) 으로
 *  base36 짧은 문자열 사용 — UI 의 긴 이름 truncation/ellipsis 시 `new RegExp(name)`
 *  매칭 실패 회피 (run #5 의 Group 1 Mode A beforeAll fail 원인). */
export const mobilePartyroomName = () => `MTOS${Date.now().toString(36)}`;
export const mobilePlaylistName = () => `MTOSpl${Date.now().toString(36)}`;

export async function gotoMobileRoomAndWaitForVideo(page: Page, partyroomUrl: string) {
  await page.goto(partyroomUrl);
  await expect(page.getByTestId('video-wrapper')).toBeVisible({ timeout: 30_000 });
}

export async function expectIframeMeetsMinSize(page: Page) {
  const iframe = page.locator('iframe[src*="youtube.com/embed"]');
  await expect(iframe).toBeVisible();
  // toBeVisible() 는 element 존재 + display!=none 만 본다. boundingBox 는 layout 완료가
  // 필요해 lazy 로드(react-player dynamic import) 직후엔 transient null/0 을 반환 → flake.
  // layout 이 확정될 때까지(width>0) 폴링한 뒤 단언한다.
  await expect
    .poll(async () => (await iframe.boundingBox())?.width ?? 0, { timeout: 5_000 })
    .toBeGreaterThan(0);
  const box = await iframe.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  // ToS 핵심 가드: viewport 양 축 모두 ≥200px.
  expect(box.width).toBeGreaterThanOrEqual(MIN_PLAYER_VIEWPORT_PX);
  expect(box.height).toBeGreaterThanOrEqual(MIN_PLAYER_VIEWPORT_PX);
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) return;
  // 화면 안에 위치 (off-screen 으로 숨기지 않음).
  expect(box.x).toBeGreaterThan(-box.width);
  expect(box.y).toBeGreaterThan(-box.height);
  expect(box.x).toBeLessThan(viewport.width);
  expect(box.y).toBeLessThan(viewport.height);
}

export async function expectIframeNotVisuallyHidden(page: Page) {
  const result = await page.locator('iframe[src*="youtube.com/embed"]').evaluate((el) => {
    const style = window.getComputedStyle(el);
    return { opacity: parseFloat(style.opacity), visibility: style.visibility };
  });
  expect(result.visibility).not.toBe('hidden');
  expect(result.opacity).toBeGreaterThan(0);
}

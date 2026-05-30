import path from 'path';
import { type Browser, type BrowserContext, type Page, devices, expect } from '@playwright/test';
import { e2eEnv } from '../config/env';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';

/**
 * chunk 4 (dj-register / add-tracks) 공용 e2e 헬퍼.
 *
 * 책임 분리는 display-board.tos.spec.ts 의 패턴을 그대로 따른다:
 * - partyroom 생성 / playlist 생성 / DJ 등록 는 **데스크탑 (user1)** 가 setup.
 *   createPartyroom helper 의 'Be a pfplay host' 버튼이 모바일 lobby 에 부재 →
 *   모바일 viewport 에서 setup fail (project_mobile_responsive_scope_340 메모).
 * - 본 spec 의 mobile context (user2) 는 만들어진 partyroom 에 직접 join 해서
 *   queue 패널의 모바일 분기 (SelectPlaylistSheet / AddTracksSheet / MiniPlayer)
 *   만 단언.
 *
 * 패턴은 display-board.tos.spec.ts (chunk 3.1 §5) 와 동일.
 */

const AUTH_DIR = path.join(__dirname, '../.auth');

const API_BASE = e2eEnv.E2E_API_BASE;

/** title prefix 6 종 (E2EA/B/C/D / MTOS / MOBILE-TOS- / MDJ / MAT) 정리.
 *  display-board.tos.spec.ts 의 동명 패턴과 1:1 일치. */
export const E2E_PARTYROOM_TITLE_PATTERN = /^(E2EA|E2EB|E2EC|E2ED|MTOS|MOBILE-TOS-|MDJ|MAT)/;

/** chunk 4 spec 의 unique partyroom title (Date.now base36). */
export const chunk4PartyroomName = (prefix: 'MDJ' | 'MAT') => `${prefix}${Date.now().toString(36)}`;

/** chunk 4 spec 의 unique playlist title. */
export const chunk4PlaylistName = (prefix: 'MDJpl' | 'MATpl') =>
  `${prefix}${Date.now().toString(36)}`;

export async function newDesktopUserContext(
  browser: Browser,
  authFile: string
): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    ...devices['Desktop Chrome'],
    storageState: path.join(AUTH_DIR, authFile),
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  return ctx;
}

/**
 * 과거 비정상 종료로 누적된 e2e test partyrooms 정리.
 * backend '1 user 1 host' 제약 회피용 — 자세한 의도는 display-board.tos.spec.ts 참조.
 */
export async function cleanupMobileTestPartyrooms(ctx: BrowserContext): Promise<void> {
  try {
    const response = await ctx.request.get(new URL('v1/partyrooms', API_BASE).toString());
    if (!response.ok()) return;
    const list = (await response.json()) as Array<{ partyroomId: number; title: string }>;
    const stale = list.filter((p) => E2E_PARTYROOM_TITLE_PATTERN.test(p.title));
    for (const p of stale) {
      await ctx.request
        .delete(new URL(`v1/partyrooms/${p.partyroomId}`, API_BASE).toString())
        .catch(() => null);
    }
  } catch {
    // cleanup 실패는 test 결과 가리지 않음
  }
}

/**
 * 화면 모달 / JS 에러 추적 강화 (display-board.tos.spec.ts 동명 함수 복사).
 *
 * - pageerror: uncaught JS exception
 * - dialog: alert/confirm/prompt — dismiss 후 본문 기록
 * - console.error / console.warn
 * - Next.js dev overlay DOM 주기 스캔
 */
export function attachErrorTracing(page: Page, log: (m: string) => void) {
  page.on('pageerror', (err) => {
    log(`pageerror: ${err.message}\n${err.stack ?? ''}`);
  });
  page.on('dialog', async (dialog) => {
    log(`dialog ${dialog.type()}: ${dialog.message()}`);
    await dialog.dismiss().catch(() => null);
  });
  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error' || t === 'warning') {
      log(`browser console.${t}: ${msg.text()}`);
    }
  });
  const interval = setInterval(async () => {
    try {
      const overlay = page.locator('nextjs-portal, [data-nextjs-dialog]').first();
      if (await overlay.isVisible({ timeout: 100 }).catch(() => false)) {
        const text = await overlay.textContent({ timeout: 500 }).catch(() => null);
        if (text) log(`next-overlay: ${text.replace(/\s+/g, ' ').slice(0, 500)}`);
      }
    } catch {
      clearInterval(interval);
    }
  }, 3000);
  page.on('close', () => clearInterval(interval));
}

/**
 * 모바일 viewport (user2) 의 partyroom 진입 + ready 단언.
 *
 * - goto(partyroomUrl)
 * - mobile-tab-queue (mobile 룸 shell 의 탭바) visible (= mobile room shell mounted)
 * - __PFPLAY_E2E__.subscribedRoomId === partyroomId (= STOMP 구독 성공 = me/crewId 라우딩 완료)
 *
 * 데스크탑 패턴인 `enterPartyroomAndWaitUntilReady` 의 'DJ Queue' 버튼 단언은
 * 모바일에 없으므로 (mobile shell = display-board + room-tabs) 사용 못함.
 * 본 헬퍼는 mobile 전용 등가물.
 */
export async function enterMobileRoomAndWaitReady(page: Page, partyroomUrl: string) {
  await page.goto(partyroomUrl);
  await expect(page.getByTestId('mobile-tab-queue')).toBeVisible({ timeout: 30_000 });

  const partyroomId = Number(partyroomUrl.match(/\/parties\/(\d+)/)?.[1]);
  await expect
    .poll(
      async () =>
        page.evaluate((id) => {
          return (
            (
              window as Window & {
                __PFPLAY_E2E__?: {
                  subscribedRoomId?: number;
                };
              }
            ).__PFPLAY_E2E__?.subscribedRoomId === id
          );
        }, partyroomId),
      { timeout: 20_000 }
    )
    .toBe(true);
}

/**
 * 데스크탑 (user1) 컨텍스트로 새 empty playlist 생성.
 * createPlaylistWithTracks 의 'add tracks' 단계만 생략한 등가물.
 *
 * 사용처: add-tracks.spec.ts 가 user2 mobile 에서 '빈 카드 + 곡 추가' CTA 를 트리거하려면
 * user2 가 musicCount=0 인 playlist 를 최소 1개 보유해야 한다. 매 run 마다 fresh
 * empty playlist 를 생성해서 동작 보장.
 */
export async function createEmptyPlaylist(page: Page, playlistName: string) {
  const partiesUrl = /\/parties(?:$|[/?#])/;
  let onParties = false;
  for (let attempt = 0; attempt < 2 && !onParties; attempt++) {
    if (!partiesUrl.test(page.url())) {
      await page.goto('/parties');
    }
    try {
      await page.waitForURL(partiesUrl, { timeout: 30_000 });
      onParties = true;
    } catch {
      await page.goto('/parties');
    }
  }

  const playlistButton = page.getByRole('button', { name: /^playlist$/i });
  await expect(playlistButton).toBeVisible({ timeout: 30_000 });
  await playlistButton.click();
  await expect(page.getByRole('button', { name: /add list/i })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /add list/i }).click();

  const playlistNameInput = page.locator('[role="dialog"] input[name="name"]');
  await expect(playlistNameInput).toBeVisible({ timeout: 5_000 });
  await playlistNameInput.fill(playlistName);
  await page.getByRole('button', { name: /^add$/i }).click();

  // playlist 생성만 하고 트랙 추가 단계 skip → musicCount=0.
  // drawer 가 자동으로 새 playlist 를 펼치는 경우가 있어 닫아둔다.
  const drawerClose = page.locator('[data-testid="drawer-close-button"]');
  if (await drawerClose.isVisible().catch(() => false)) {
    await drawerClose.click().catch(() => null);
  }
}

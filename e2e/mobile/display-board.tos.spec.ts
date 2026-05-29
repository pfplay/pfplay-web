import path from 'path';
import { type Browser, type BrowserContext, type Page, devices, expect } from '@playwright/test';
import {
  CHAT_SCROLL_TOLERANCE_PX,
  COLLAPSED_VIDEO_HEIGHT,
  COLLAPSED_VIDEO_WIDTH,
  expectIframeNotVisuallyHidden,
  expectIframeToBeOnScreen,
  gotoMobileRoomAndWaitForVideo,
  mobilePartyroomName,
  mobilePlaylistName,
} from './display-board.helpers';
import { test } from '../fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';
import {
  closePartyroom,
  createPartyroom,
  createPlaylistWithTracks,
  enterPartyroomAndWaitUntilReady,
  registerAsDj,
} from '../helpers/partyroom.helpers';

/**
 * chunk 3.1 spec §5 — ToS 보존 가드 (Playwright headed, mandatory CI).
 *
 * iPhone 13 (390×844) 단일 매트릭스 — 추가 viewport (SE / Pixel) 는 후속 polish.
 *
 * **setup 책임 분리 (chunk 5 reviewer BLOCKING #1 post-merge fix)**:
 * - partyroom 생성 / DJ 등록 / playlist UI 는 *desktop* 만 노출 (mobile UX 는 join 중심,
 *   [[project_mobile_responsive_scope_340]]). createPartyroom helper 의 'Be a pfplay
 *   host' 버튼이 모바일 lobby 에 부재 → 모바일 viewport 에서 setup fail.
 * - 본 spec 은 `beforeAll` 에서 **desktop context (user1)** 가 partyroom 을 setup 하고
 *   DJ session 을 keep-alive. 각 테스트는 **mobile context (user2)** 가 partyroom URL 로
 *   직접 진입해 ToS 가드만 assertion. setup 1회 공유로 5 cases 총 소요 ~2 min.
 */

const AUTH_DIR = path.join(__dirname, '../.auth');

async function newDesktopUserContext(browser: Browser): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    ...devices['Desktop Chrome'],
    storageState: path.join(AUTH_DIR, 'a-user1.json'),
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  return ctx;
}

const API_BASE = process.env.NEXT_PUBLIC_API_HOST_NAME ?? 'https://dev-api.pfplay.xyz/api/';

/**
 * Defensive cleanup — 과거 비정상 종료 (workflow timeout, SIGKILL 등) 로 누적된
 * mobile test partyrooms 정리. backend '1 user 1 host' 제약 회피.
 *
 * 동작:
 * 1. GET /v1/partyrooms → ACTIVE 전체 list
 * 2. title prefix 'MTOS' 또는 'MOBILE-TOS-' 인 row 만 필터 (mobile test 명명)
 * 3. 각각 DELETE 시도 — 권한 없거나 이미 정리됐으면 silently 흡수
 *
 * title prefix 가 일반 사용자 명명과 겹칠 가능성 0 (테스트 전용 접두사).
 */
async function cleanupMobileTestPartyrooms(ctx: BrowserContext): Promise<void> {
  try {
    const response = await ctx.request.get(new URL('v1/partyrooms', API_BASE).toString());
    if (!response.ok()) return;
    const list = (await response.json()) as Array<{ partyroomId: number; title: string }>;
    const stale = list.filter((p) => /^(MTOS|MOBILE-TOS-)/.test(p.title));
    for (const p of stale) {
      await ctx.request
        .delete(new URL(`v1/partyrooms/${p.partyroomId}`, API_BASE).toString())
        .catch(() => null);
    }
  } catch {
    // cleanup 실패는 test 결과 가리지 않음
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: 재생 활성 (Mode A / 토글 / chat scroll — 4 tests, 1 partyroom 공유)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('재생 활성 — Mode A/B 토글 + chat scroll', () => {
  test.describe.configure({ mode: 'serial' });

  let djContext: BrowserContext;
  let djPage: Page;
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[Group 1 beforeAll][${Date.now() - t0}ms] ${m}`);
    djContext = await newDesktopUserContext(browser);
    djPage = await djContext.newPage();
    djPage.on('console', (msg) => {
      if (msg.type() === 'error') log(`browser console.error: ${msg.text()}`);
    });
    // ⚠️ 과거 비정상 종료로 누적된 mobile test partyrooms 정리 — backend '1 user 1 host' 제약 회피
    log('defensive cleanup');
    await cleanupMobileTestPartyrooms(djContext);
    log('cleanup done');
    // createPartyroom 의 'Be a pfplay host' 는 /parties lobby UI 의 버튼. blank page 에서
    // 호출하면 못 찾음 → e2e-a 패턴 (goto /parties 먼저, 그 후 createPlaylistWithTracks +
    // createPartyroom) 그대로 따른다.
    log('goto /parties');
    await djPage.goto('/parties');
    log('createPlaylistWithTracks');
    await createPlaylistWithTracks(djPage, mobilePlaylistName());
    log('createPartyroom');
    partyroomUrl = await createPartyroom(djPage, mobilePartyroomName());
    log(`partyroom created: ${partyroomUrl}`);
    await enterPartyroomAndWaitUntilReady(djPage, partyroomUrl);
    log('ready');
    await registerAsDj(djPage);
    log('DJ registered');
    // djContext alive 유지 — DJ session 끊기면 mobile listener 가 Mode A 진입 X.
  });

  test.afterAll(async () => {
    // backend partyroom termination 필수 — backend 가 'user 1 host' 제약을 가진다.
    // afterAll 에서 partyroom 정리 안 하면 user1 이 host 로 락된 채 다음 describe 의
    // beforeAll 의 createPartyroom 이 403 으로 fail (Mode C beforeAll lock-out).
    if (djPage && !djPage.isClosed() && partyroomUrl) {
      await closePartyroom(djPage, partyroomUrl).catch(() => null);
    }
    if (djContext) await djContext.close();
  });

  test('Mode A 진입: IFrame visible + boundingBox ≥ 80×45 + viewport 안 + 시각 hidden 아님', async ({
    user2Context,
  }) => {
    test.setTimeout(60_000);
    const page = await user2Context.newPage();
    await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);
    await expectIframeToBeOnScreen(page);
    await expectIframeNotVisuallyHidden(page);
  });

  test('Mode A → Mode B 토글: wrapper 80×45 정확값 + IFrame 여전히 visible + DOM identity 보존', async ({
    user2Context,
  }) => {
    test.setTimeout(60_000);
    const page = await user2Context.newPage();
    await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

    const iframeBefore = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
    expect(iframeBefore).not.toBeNull();

    await page.getByRole('button', { name: '영상 가리기' }).click();
    await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();

    const wrapper = page.getByTestId('video-wrapper');
    const wrapperBox = await wrapper.boundingBox();
    expect(wrapperBox).not.toBeNull();
    if (!wrapperBox) return;
    expect(Math.round(wrapperBox.width)).toBe(COLLAPSED_VIDEO_WIDTH);
    expect(Math.round(wrapperBox.height)).toBe(COLLAPSED_VIDEO_HEIGHT);

    await expectIframeNotVisuallyHidden(page);

    const iframeAfter = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
    expect(iframeAfter).not.toBeNull();
    const sameElement = await page.evaluate(([a, b]) => a === b, [iframeBefore, iframeAfter]);
    expect(sameElement).toBe(true);
  });

  test('Mode B → Mode A 복귀: IFrame 동일 element + 16:9 wrapper 복귀', async ({
    user2Context,
  }) => {
    test.setTimeout(60_000);
    const page = await user2Context.newPage();
    await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

    const iframeInitial = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();

    await page.getByRole('button', { name: '영상 가리기' }).click();
    await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();
    await page.getByRole('button', { name: '영상 펼치기' }).click();
    await expect(page.getByRole('button', { name: '영상 가리기' })).toBeVisible();

    const wrapper = page.getByTestId('video-wrapper');
    await expect(wrapper).toHaveClass(/aspect-video/);

    const iframeAfter = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
    const sameElement = await page.evaluate(([a, b]) => a === b, [iframeInitial, iframeAfter]);
    expect(sameElement).toBe(true);
  });

  test('sticky-top 높이 변화 시 chat scroll offset ≤ CHAT_SCROLL_TOLERANCE_PX 보존', async ({
    user2Context,
  }) => {
    test.setTimeout(60_000);
    const page = await user2Context.newPage();
    await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

    const chatTab = page.getByRole('tab', { name: /채팅/ }).first();
    if (await chatTab.isVisible().catch(() => false)) {
      await chatTab.click();
    }

    const chatContainer = page.locator('[data-tab-content="chat"]').first();
    await expect(chatContainer).toBeVisible();

    await page.waitForTimeout(500);

    const scrollBefore = await chatContainer.evaluate((el) => el.scrollTop);

    await page.getByRole('button', { name: '영상 가리기' }).click();
    await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();
    await page.waitForTimeout(300);

    const scrollAfter = await chatContainer.evaluate((el) => el.scrollTop);

    const delta = Math.abs(scrollAfter - scrollBefore);
    expect(delta).toBeLessThanOrEqual(CHAT_SCROLL_TOLERANCE_PX);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: 재생 없음 (Mode C — 1 test, DJ 등록 X 의 별도 partyroom)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('재생 없음 — Mode C', () => {
  test.describe.configure({ mode: 'serial' });

  let setupContext: BrowserContext;
  let setupPage: Page;
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    // Group 1 (180s) 와 통일 — cold-start 여파로 120s 가 부족했음 (run #5).
    test.setTimeout(180_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[Mode C beforeAll][${Date.now() - t0}ms] ${m}`);
    setupContext = await newDesktopUserContext(browser);
    setupPage = await setupContext.newPage();
    setupPage.on('console', (msg) => {
      if (msg.type() === 'error') log(`browser console.error: ${msg.text()}`);
    });
    log('defensive cleanup');
    await cleanupMobileTestPartyrooms(setupContext);
    log('cleanup done');
    log('goto /parties');
    await setupPage.goto('/parties');
    log('createPartyroom');
    partyroomUrl = await createPartyroom(setupPage, mobilePartyroomName());
    log(`partyroom created: ${partyroomUrl}`);
    await enterPartyroomAndWaitUntilReady(setupPage, partyroomUrl);
    log('ready');
    // DJ 등록 / playlist 모두 skip — playback 없는 상태로 mobile 이 진입 시 Mode C 트리거.
  });

  test.afterAll(async () => {
    if (setupPage && !setupPage.isClosed() && partyroomUrl) {
      await closePartyroom(setupPage, partyroomUrl).catch(() => null);
    }
    if (setupContext) await setupContext.close();
  });

  test('Mode C: BlankPlaceholder visible + IFrame 미존재', async ({ user2Context }) => {
    test.setTimeout(60_000);
    const page = await user2Context.newPage();
    await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);
    await expect(page.getByTestId('blank-placeholder')).toBeVisible();
    await expect(page.locator('iframe[src*="youtube.com/embed"]')).toHaveCount(0);
  });
});

import path from 'path';
import { type Browser, type BrowserContext, type Page, devices, expect } from '@playwright/test';
import {
  expectIframeMeetsMinSize,
  expectIframeNotVisuallyHidden,
  gotoMobileRoomAndWaitForVideo,
  mobilePartyroomName,
  mobilePlaylistName,
} from './display-board.helpers';
import { e2eEnv } from '../config/env';
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
    extraHTTPHeaders: e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  return ctx;
}

const API_BASE = e2eEnv.E2E_API_BASE;

/**
 * 화면 모달 / JS 에러 추적 강화. 디버그 로그에 4종 source 의 에러를 통합:
 *
 * - `page.on('pageerror')`: uncaught JS exception (window.onerror, React error boundary, Next dev overlay 의 빨간 화면)
 * - `page.on('dialog')`: window.alert / confirm / prompt 모달 — 등장 시 dismiss + 본문 기록
 * - `page.on('console')`: console.error / console.warn (기존)
 * - Next.js dev overlay DOM 주기 스캔: `nextjs-portal` / `[data-nextjs-dialog]` selector 의 textContent
 *
 * Playwright config 의 trace/video 는 retry 시 자동 캡쳐 (test-results/).
 * CI workflow 의 artifact path 도 test-results/ 포함으로 확장 필요 (별도 변경).
 */
function attachErrorTracing(page: Page, log: (m: string) => void) {
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
  // Next.js dev overlay 주기 스캔 (3s 간격) — 빠른 fail 시점에 overlay 잡힘
  const interval = setInterval(async () => {
    try {
      const overlay = page.locator('nextjs-portal, [data-nextjs-dialog]').first();
      if (await overlay.isVisible({ timeout: 100 }).catch(() => false)) {
        const text = await overlay.textContent({ timeout: 500 }).catch(() => null);
        if (text) log(`next-overlay: ${text.replace(/\s+/g, ' ').slice(0, 500)}`);
      }
    } catch {
      // page closed during scan — clear interval
      clearInterval(interval);
    }
  }, 3000);
  page.on('close', () => clearInterval(interval));
}

/**
 * Defensive cleanup — 과거 비정상 종료 (workflow timeout, SIGKILL 등) 로 누적된
 * e2e test partyrooms 정리. backend '1 user 1 host' 제약 회피.
 *
 * 동작:
 * 1. GET /v1/partyrooms → ACTIVE 전체 list
 * 2. title prefix e2e 6종 ('E2EA'/'E2EB'/'E2EC'/'E2ED'/'MTOS'/'MOBILE-TOS-') 필터
 * 3. 각각 DELETE 시도 — 권한 없거나 정리됐으면 silently 흡수
 *
 * mobile project 가 a-user1 storage state 를 e2e-a 와 공유 — e2e-a/b/c/d 가
 * afterAll 의 closePartyroom 실패 시 (네트워크 / 권한 / 비정상 종료) 누적되는
 * 해당 user host stale 도 함께 정리해야 mobile beforeAll 의 createPartyroom 이
 * 'ALREADY_HOST' 403 으로 fail 안 함.
 *
 * title prefix 일반 사용자 명명과 겹칠 가능성 0 (테스트 전용 접두사).
 */
const E2E_PARTYROOM_TITLE_PATTERN = /^(E2EA|E2EB|E2EC|E2ED|MTOS|MOBILE-TOS-|MDJ|MAT)/;

async function cleanupMobileTestPartyrooms(ctx: BrowserContext): Promise<void> {
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

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: 재생 활성 — 임베드 플레이어 ToS 최소 크기(≥200×200) 가드 (issue #420)
//   과거 80×45 "Mode B" 축소·접기 토글은 정책 위반이라 제거. 영상은 모든 탭에서 전체너비 유지.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('재생 활성 — ToS 최소 크기(≥200×200) 가드', () => {
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
    attachErrorTracing(djPage, log);
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

  test('채팅 탭(기본): IFrame viewport ≥200×200 + 화면 안 + 시각 hidden 아님', async ({
    user2Context,
  }) => {
    test.setTimeout(60_000);
    const page = await user2Context.newPage();
    await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);
    await expectIframeMeetsMinSize(page);
    await expectIframeNotVisuallyHidden(page);
  });

  test('크루 탭 전환: 관리 탭에서도 IFrame viewport ≥200×200 유지 (축소 회귀 가드, issue #420)', async ({
    user2Context,
  }) => {
    test.setTimeout(60_000);
    const page = await user2Context.newPage();
    await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

    // 사용자 보고 회귀: 크루 목록 탭에서 전광판이 80×45 로 축소되던 정책 위반. 이제 전체너비 유지.
    await page.getByTestId('mobile-tab-crew').click();
    await expect(page.getByTestId('mobile-tab-crew')).toHaveAttribute('aria-selected', 'true');

    await expectIframeMeetsMinSize(page);
    await expectIframeNotVisuallyHidden(page);
  });

  test('DJ 큐 탭 전환: 관리 탭에서도 IFrame viewport ≥200×200 유지', async ({ user2Context }) => {
    test.setTimeout(60_000);
    const page = await user2Context.newPage();
    await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

    await page.getByTestId('mobile-tab-queue').click();
    await expect(page.getByTestId('mobile-tab-queue')).toHaveAttribute('aria-selected', 'true');

    await expectIframeMeetsMinSize(page);
    await expectIframeNotVisuallyHidden(page);
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
    attachErrorTracing(setupPage, log);
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

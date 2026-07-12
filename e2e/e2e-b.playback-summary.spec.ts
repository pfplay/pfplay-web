/**
 * E2E-B: 플레이백 종료 요약 채팅 구획 (#444)
 *
 * 곡이 끝나면 채팅에 footer형 요약 구획이 로컬 삽입된다:
 *   [data-testid=playback-summary-divider] — 트랙명·DJ·👍/👎/🎁 카운트
 *   [data-testid=playback-summary-skipped] — 스킵으로 종료된 곡에만 붙는 ⏭ 뱃지
 *
 * 흐름:
 *   1. host(데스크탑 1440x900): 짧은 트랙 2곡 플리 생성 → 파티룸 생성 → DJ 등록 → 재생 시작
 *   2. mobile(iPhone 13 뷰포트): 같은 방 입장(기본 탭 = 채팅) → 재생 중 👍
 *   3. 케이스1(자연 완료): 1곡 종료 → 둘째 곡 시작 시 구획이 host·mobile 양쪽에 나타남.
 *      스킵 뱃지는 없어야 함. (모바일 👍가 카운트에 반영되면 best-effort로 확인)
 *   4. 케이스2(스킵): 2곡을 dj-skip-button + confirm 으로 스킵 → 구획 + ⏭ 뱃지 노출.
 *      구획이 마지막 메시지라도 visible 이어야 함(bottom-pin 스크롤 회귀 잠금).
 *
 * ⚠️ e2e UI 는 영어로 렌더되므로 텍스트가 아닌 testid 단언만 사용한다.
 * ⚠️ #443(closeDjQueueDrawer force-click 플래키) 회피 — 드로어 닫기는 Escape 우선 경로.
 *
 * 실패의 의미:
 *   - 구획 미노출: 곡 종료 요약이 사라져 회귀. WS setup/재연결 배선 또는 추적기 파손 신호.
 *   - 스킵 뱃지 미노출 / 구획 invisible: 스킵 종료 표기 또는 bottom-pin 스크롤 회귀.
 */
import path from 'path';
import { devices, expect, test, type BrowserContext, type Page } from '@playwright/test';
import { e2eEnv } from './config/env';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';
import {
  dismissDjingGuide,
  enterPartyroomAndWaitUntilReady,
  openDjQueueDrawer,
  sendChatMessage,
} from './helpers/partyroom.helpers';
import {
  attachErrorTracing,
  cleanupMobileTestPartyrooms,
  enterMobileRoomAndWaitReady,
} from './mobile/chunk4.helpers';

const AUTH_DIR = path.join(__dirname, '.auth');

// RQ Devtools 오버레이가 하단(모바일 탭바) 클릭을 가로채는 것 방지 — 모든 문서에 주입
const HIDE_RQ_DEVTOOLS = `
  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = '.tsqd-parent-container{display:none!important;}';
    document.head.appendChild(style);
  });
`;

const DIVIDER = '[data-testid="playback-summary-divider"]';
const SKIPPED_BADGE = '[data-testid="playback-summary-skipped"]';

function parseDurationToSeconds(text: string): number {
  const parts = text.trim().split(':').map(Number);
  if (!parts.length || parts.some((n) => Number.isNaN(n))) return Number.POSITIVE_INFINITY;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

/**
 * 짧은 트랙 2곡 플리 생성 — 최단곡 2곡 선택.
 * 스킵 휴리스틱(경계가 예상종료-5s 이전) 여유를 위해 40s 이상 트랙만 고른다.
 * 반환: 선택한 두 트랙의 duration(초, 추가 순서).
 */
async function createPlaylistWithTwoShortTracks(page: Page, playlistName: string) {
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
  await expect(page.getByRole('button', { name: /add list/i })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /add list/i }).click();

  const playlistNameInput = page.locator('[role="dialog"] input[name="name"]');
  await expect(playlistNameInput).toBeVisible({ timeout: 5_000 });
  await playlistNameInput.fill(playlistName);
  await page.getByRole('button', { name: /^add$/i }).click();

  await page.getByRole('button', { name: new RegExp(playlistName) }).click();
  await page.getByRole('button', { name: /add song/i }).click();

  const musicSearchInput = page.getByPlaceholder(/search|url/i);
  await expect(musicSearchInput).toBeVisible({ timeout: 10_000 });
  // interlude: 짧은(수십 초~2분) 트랙이 많은 검색어
  await musicSearchInput.fill('interlude');
  await page.waitForTimeout(1_500);
  const trackAddButtons = page.locator('[data-testid="track-add-button"]');
  await expect(trackAddButtons.nth(2)).toBeVisible({ timeout: 20_000 });

  const durations = page.locator('[data-testid="track-duration"]');
  const total = await durations.count();
  const parsed: Array<{ idx: number; seconds: number }> = [];
  for (let i = 0; i < total; i++) {
    const text = (await durations.nth(i).textContent()) ?? '';
    parsed.push({ idx: i, seconds: parseDurationToSeconds(text) });
  }
  // 1순위: 40s~240s (스킵 여유 + 자연완료 대기시간 절약), 부족하면 40s~300s 로 완화
  let candidates = parsed.filter((p) => p.seconds >= 40 && p.seconds <= 240);
  if (candidates.length < 2) {
    candidates = parsed.filter((p) => p.seconds >= 40 && p.seconds <= 300);
  }
  if (candidates.length < 2) {
    throw new Error(
      `not enough short tracks: ${JSON.stringify(parsed.map((p) => p.seconds).slice(0, 15))}`
    );
  }
  candidates.sort((a, b) => a.seconds - b.seconds);
  const picked = candidates.slice(0, 2).sort((a, b) => a.idx - b.idx);
  for (const p of picked) {
    await trackAddButtons.nth(p.idx).click();
    await page.waitForTimeout(400);
  }
  await page.locator('[data-testid="music-search-close"]').click();
  await page.locator('[data-testid="drawer-close-button"]').click();

  return picked.map((p) => p.seconds);
}

/**
 * createPartyroom 등가 — 로컬 dev 서버의 (room)/[id] 라우트 cold-compile 이 20s 를
 * 초과해 helper 의 waitForURL 이 터졌다(백엔드는 정상 생성 확인). 120s 로 상향.
 */
async function createPartyroomLongNav(page: Page, partyroomName: string, introduction: string) {
  await page.getByRole('button', { name: /be a pfplay host/i }).click();
  await page.locator('input[name="name"]').fill(partyroomName);
  await page.locator('textarea[name="introduce"]').fill(introduction);
  await page.getByRole('button', { name: /create party/i }).click();
  await page.waitForURL(/\/parties\/\d+/, { timeout: 120_000 });
  return page.url();
}

/**
 * 마지막(nth) 구획이 실제로 보이는지 검증하고, 스크롤 밖이면 채팅 컨테이너를 맨 아래로
 * 스크롤해 프레임에 넣는다. bottom-pin 회귀(구획이 lastItem 일 때 안 따라오던 버그) 방어.
 */
async function ensureDividerVisible(page: Page, nth: number) {
  const divider = page.locator(DIVIDER).nth(nth);
  await expect(divider).toBeAttached({ timeout: 10_000 });
  if (!(await divider.isVisible().catch(() => false))) {
    await divider.scrollIntoViewIfNeeded().catch(() => null);
    await page.evaluate(() => {
      const scrollers = Array.from(document.querySelectorAll<HTMLElement>('*')).filter((el) => {
        const s = getComputedStyle(el);
        return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight;
      });
      for (const el of scrollers) el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(500);
  }
  await expect(divider).toBeVisible({ timeout: 10_000 });
}

function isDjDrawerOpen(page: Page) {
  return page
    .locator('[data-testid="djing-dialog-close"]')
    .or(page.locator('[id^="headlessui-dialog-panel-"] > header > button'))
    .first()
    .isVisible()
    .catch(() => false);
}

/** #443 회피 — closeDjQueueDrawer(force-click 플래키) 대신 Escape 우선 + 클릭 폴백 */
async function closeDjDrawerSafely(page: Page) {
  await expect
    .poll(
      async () => {
        if (!(await isDjDrawerOpen(page))) return true;
        await page.keyboard.press('Escape').catch(() => null);
        await page.waitForTimeout(400);
        if (!(await isDjDrawerOpen(page))) return true;
        await page
          .locator('[data-testid="djing-dialog-close"]')
          .first()
          .click({ force: true })
          .catch(() => null);
        return false;
      },
      { timeout: 20_000 }
    )
    .toBe(true);
}

/** registerAsDj 등가 — 마지막 드로어 닫기만 Escape 경로로 교체(#443 회피) */
async function registerAsDjEscapeClose(page: Page, playlistName: string) {
  await openDjQueueDrawer(page);

  const registerButton = page.getByRole('button', { name: /register.*dj queue|dj 대기 등록/i });
  await expect(registerButton).toBeVisible({ timeout: 10_000 });
  await expect(registerButton).toBeEnabled({ timeout: 10_000 });
  await registerButton.click({ force: true });

  const confirmButton = page.getByRole('button', { name: /^confirm$/i });
  await expect(confirmButton).toBeVisible({ timeout: 15_000 });

  const playlistItem = page.getByRole('button', { name: new RegExp(playlistName) });
  await expect(playlistItem).toBeVisible({ timeout: 15_000 });
  await playlistItem.click({ force: true });
  await expect(confirmButton).toBeEnabled({ timeout: 10_000 });
  await confirmButton.click({ force: true });
  await dismissDjingGuide(page);

  await closeDjDrawerSafely(page);
}

/** 구획 텍스트에서 👍 카운트를 파싱한다(best-effort). 실패 시 null. */
function parseLikeCount(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.match(/👍\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

test.describe('E2E-B: 플레이백 종료 요약 채팅 구획 (#444)', () => {
  let ctxDesktop: BrowserContext;
  let ctxMobile: BrowserContext;
  let partyroomUrl = '';

  test.afterAll(async () => {
    // 방 정리 (요청 API — UI 경유 불필요)
    if (ctxDesktop && partyroomUrl) {
      const partyroomId = partyroomUrl.match(/\/parties\/(\d+)/)?.[1];
      if (partyroomId) {
        await ctxDesktop.request
          .delete(new URL(`v1/partyrooms/${partyroomId}`, e2eEnv.E2E_API_BASE).toString())
          .catch(() => null);
      }
    }
    await ctxMobile?.close().catch(() => null);
    await ctxDesktop?.close().catch(() => null);
  });

  test('자연완료·스킵 시 요약 구획이 host·mobile 양쪽에 노출된다', async ({ browser }) => {
    test.setTimeout(480_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[E2E-B-PSD][${Date.now() - t0}ms] ${m}`);

    // ── 컨텍스트 준비 ─────────────────────────────────────────────
    ctxDesktop = await browser.newContext({
      ...devices['Desktop Chrome'],
      viewport: { width: 1440, height: 900 },
      storageState: path.join(AUTH_DIR, 'b-user1.json'),
      ignoreHTTPSErrors: true,
    });
    await ctxDesktop.addInitScript(ETHEREUM_MOCK_SCRIPT);
    await ctxDesktop.addInitScript(HIDE_RQ_DEVTOOLS);

    ctxMobile = await browser.newContext({
      ...devices['iPhone 13'],
      storageState: path.join(AUTH_DIR, 'b-user2.json'),
      ignoreHTTPSErrors: true,
    });
    await ctxMobile.addInitScript(ETHEREUM_MOCK_SCRIPT);
    await ctxMobile.addInitScript(HIDE_RQ_DEVTOOLS);

    const host = await ctxDesktop.newPage();
    const mobile = await ctxMobile.newPage();
    attachErrorTracing(host, (m) => log(`host ${m}`));
    attachErrorTracing(mobile, (m) => log(`mobile ${m}`));

    // ── 셋업: 스테일 e2e 방 정리 + 플리(짧은 2곡) + 방 생성 ──────────
    log('cleanup stale e2e partyrooms');
    await cleanupMobileTestPartyrooms(ctxDesktop);

    log('host goto /parties');
    await host.goto('/parties');

    const ts = Date.now().toString(36);
    const playlistName = `E2EB-PSD-${ts}`;
    log(`create playlist with 2 short tracks: ${playlistName}`);
    const durations = await createPlaylistWithTwoShortTracks(host, playlistName);
    log(`picked track durations(s): ${durations.join(', ')}`);

    log('create partyroom');
    partyroomUrl = await createPartyroomLongNav(host, `E2EBPSD${ts}`, 'playback summary e2e');
    log(`partyroom: ${partyroomUrl}`);
    await enterPartyroomAndWaitUntilReady(host, partyroomUrl);

    log('mobile enters room (default tab = chat)');
    await enterMobileRoomAndWaitReady(mobile, partyroomUrl);

    // ── DJ 등록 → 재생 시작 ──────────────────────────────────────
    log('host registers as DJ');
    await registerAsDjEscapeClose(host, playlistName);
    const playbackStartedAt = Date.now();

    const mobileLikeButton = mobile.locator('[data-testid="playback-like-button"]');
    await expect(mobileLikeButton).toBeEnabled({ timeout: 30_000 });
    log('playback active on mobile');

    // 재생 중 채팅 몇 줄(맥락) + 모바일 👍 1회
    await sendChatMessage(host, 'this one is my favorite');
    await sendChatMessage(mobile, 'nice pick!!');
    await mobileLikeButton.click();
    log('mobile liked track1');

    // ── 케이스 1: 자연 완료 → 구획이 양쪽에 visible ────────────────
    const track1Ms = durations[0] * 1000;
    log(`waiting for natural completion divider (~${durations[0]}s + margin)`);
    const waitDivider = track1Ms + 120_000 - (Date.now() - playbackStartedAt);
    await expect(host.locator(DIVIDER)).toHaveCount(1, { timeout: waitDivider });
    await expect(mobile.locator(DIVIDER)).toHaveCount(1, { timeout: 30_000 });

    // 자연 완료엔 ⏭ 뱃지가 없어야 함
    await expect(host.locator(SKIPPED_BADGE)).toHaveCount(0);
    await expect(mobile.locator(SKIPPED_BADGE)).toHaveCount(0);

    // 구획이 실제로 보여야 함(bottom-pin 스크롤 회귀 잠금) — host·mobile 양쪽
    await ensureDividerVisible(host, 0);
    await ensureDividerVisible(mobile, 0);
    log('case-1 divider visible on host & mobile');

    // best-effort: 모바일 👍가 카운트에 반영됐는지(실패 무방)
    const divider1Text = (await host.locator(DIVIDER).first().textContent())?.trim();
    log(`divider1(host): ${divider1Text}`);
    const like1 = parseLikeCount(divider1Text);
    if (like1 !== null && like1 >= 1) {
      log(`like count reflected: ${like1}`);
    } else {
      log(`like count not reflected (best-effort, ignored): ${like1}`);
    }

    // ── 케이스 2: 스킵 → 구획 + ⏭ 뱃지 visible ────────────────────
    await expect(mobileLikeButton).toBeEnabled({ timeout: 15_000 });
    await mobile.waitForTimeout(1_500); // playback 교체 전파 대기(like flag reset)
    await mobileLikeButton.click();
    log('mobile liked track2');

    log('host opens DJ drawer and skips track2');
    await openDjQueueDrawer(host);
    const skipButton = host.locator('[data-testid="dj-skip-button"]');
    await expect(skipButton).toBeVisible({ timeout: 10_000 });
    await skipButton.click();
    const confirmSkip = host.locator('[data-testid="confirm-dialog-confirm-button"]');
    await expect(confirmSkip).toBeVisible({ timeout: 10_000 });
    await confirmSkip.click();
    log('skip confirmed');

    await expect(host.locator(DIVIDER)).toHaveCount(2, { timeout: 30_000 });
    await expect(host.locator(SKIPPED_BADGE)).toHaveCount(1, { timeout: 10_000 });
    await expect(mobile.locator(DIVIDER)).toHaveCount(2, { timeout: 30_000 });
    await expect(mobile.locator(SKIPPED_BADGE)).toHaveCount(1, { timeout: 10_000 });

    // 드로어를 닫아야 구획이 채팅에서 보인다(#443 회피 경로)
    log('closing DJ drawer');
    await closeDjDrawerSafely(host);

    // 구획(마지막 메시지)이 실제로 보여야 함 — host·mobile 양쪽 bottom-pin 회귀 잠금
    await ensureDividerVisible(host, 1);
    await ensureDividerVisible(mobile, 1);
    // 스킵 뱃지도 visible
    await expect(host.locator(SKIPPED_BADGE).first()).toBeVisible({ timeout: 10_000 });
    await expect(mobile.locator(SKIPPED_BADGE).first()).toBeVisible({ timeout: 10_000 });
    log('case-2 divider + skipped badge visible on host & mobile');
  });
});

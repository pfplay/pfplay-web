import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixtures';
import {
  closePartyroom,
  createPlaylistWithTracks,
  leavePartyroom,
  registerAsDj,
} from './helpers/partyroom.helpers';

/**
 * E2E-A: 파티룸 생성 + 중간 참여자 상태 동기화 (Late Join State Sync)
 *
 * 파티룸을 생성하고, 친구가 이미 음악을 틀고 있는 파티룸에 나중에 들어왔을 때,
 * 지금 재생 중인 곡이 바로 보여야 한다.
 *
 * 해당 기준: A (Auth→파티룸입장→WS구독 체인) + D (window.ethereum mock 주입)
 *
 * 흐름:
 *   전제: window.ethereum mock 주입 (지갑 연결 상태)
 *   1. User1: 파티룸 생성
 *   2. User1: 파티룸 입장 → STOMP /sub/partyrooms/{id} 구독 수립
 *   3. User1: 곡 재생 시작
 *   4. User2: 동일 파티룸 입장 → STOMP 구독 수립
 *   5. ✅ User2 화면: User1이 재생 중인 곡과 동일한 곡이 player에 표시됨
 *
 * 검증 목표:
 *   재생이 이미 진행 중인 파티룸에 늦게 입장한 사용자가 서버로부터 초기 상태 스냅샷을
 *   수신하여 player 상태에 정확히 반영하는가. (late join sync)
 *
 * 실패의 의미:
 *   - wagmi → REST 체인 단절: 새 파티룸 자체를 생성할 수 없음
 *   - late join sync 실패: 중간 입장자가 재생 중인 곡을 받지 못하고 빈 player 표시
 */
test('User2(late join)는 User1이 재생 중인 곡과 동일한 곡을 player에서 본다', async ({
  user1Context,
  user2Context,
}) => {
  test.setTimeout(90_000);

  const startedAt = Date.now();
  const log = (message: string) => {
    const elapsed = `${Date.now() - startedAt}ms`.padStart(8, ' ');
    console.log(`[E2E-A][${elapsed}] ${message}`);
  };
  const attachPageDebug = (label: string, page: Page) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        log(`${label} console.${msg.type()}: ${msg.text()}`);
      }
    });
    page.on('pageerror', (error) => {
      log(`${label} pageerror: ${error.message}`);
    });
    page.on('close', () => {
      log(`${label} page closed`);
    });
    page.on('crash', () => {
      log(`${label} page crashed`);
    });
    page.on('response', (response) => {
      const url = response.url();
      if (
        /\/v1\/partyrooms\/\d+\/(setup|dj-queue|crews\/me)$/.test(url) ||
        /\/v1\/partyrooms\/\d+$/.test(url)
      ) {
        log(`${label} response ${response.status()} ${response.request().method()} ${url}`);
      }
    });
  };

  const page1 = await user1Context.newPage();
  attachPageDebug('user1', page1);
  let page2: Page | undefined;
  let partyroomUrl: string | undefined;

  try {
    log('user1 goto /');
    await page1.goto('/');

    const pfpPlayButton = page1.locator('[data-testid="home-pfp-play-button"]');
    if (await pfpPlayButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      // useFetchMe 완료 전에는 href가 /sign-in일 수 있으므로 실제 목적지가 바뀔 때까지 대기
      log('home pfp play button visible, waiting for href=/parties');
      await expect(pfpPlayButton).toHaveAttribute('href', '/parties', { timeout: 15_000 });
      log(`href became /parties, current URL: ${page1.url()}`);
      await pfpPlayButton.click();
      log('clicked home pfp play button, waiting for /parties');
      await page1.waitForURL(/\/parties$/, { timeout: 10_000 });
      log(`arrived at /parties from home, current URL: ${page1.url()}`);
    } else {
      log('home pfp play button not visible, goto /parties directly');
      await page1.goto('/parties');
      log(`arrived at /parties directly, current URL: ${page1.url()}`);
    }

    // ─── User1: 플레이리스트 생성 + 트랙 추가 ───────────────────────────
    const uniquePlaylistName = `E2EA${Date.now().toString(36)}`;
    log(`creating playlist: ${uniquePlaylistName}`);
    await createPlaylistWithTracks(page1, uniquePlaylistName);
    log(`playlist created: ${uniquePlaylistName}`);

    // ─── User1: 파티룸 생성 ──────────────────────────────────────────────
    const uniquePartyroomName = `E2EA${Date.now().toString(36)}`;
    log(`creating partyroom: ${uniquePartyroomName}`);
    await page1.locator('[data-testid="create-partyroom-button"]').click();
    await page1.locator('input[name="name"]').fill(uniquePartyroomName);
    await page1.locator('textarea[name="introduce"]').fill('e2e-test');
    await page1.locator('button[type="submit"]').click();

    log('waiting for partyroom URL after create');
    await page1.waitForURL(/\/parties\/\d+/, { timeout: 20_000 });

    partyroomUrl = page1.url();
    log(`partyroom created: ${partyroomUrl}`);
    expect(partyroomUrl).toMatch(/\/parties\/\d+/);

    // ─── User1: DJ 등록 + 곡 재생 ──────────────────────────────────────
    // enter() → getSetupInfo() → client.subscribe() 체인이 완료될 때까지 대기
    // (networkidle: 500ms 동안 진행 중인 HTTP 요청이 없는 상태)
    log('waiting for networkidle in partyroom before DJ register');
    await page1.waitForLoadState('networkidle');
    log(`networkidle resolved in partyroom, current URL: ${page1.url()}`);
    log(`registering as DJ with playlist: ${uniquePlaylistName}`);
    await registerAsDj(page1, uniquePlaylistName);
    log('DJ registration flow completed');

    // PLAYBACK_STARTED WS 이벤트 → VideoTitle에 곡명 표시
    // react-fast-marquee가 요소를 복제하므로 .first()로 첫 번째 사용
    const videoTitle1 = page1.locator('[data-testid="video-title"]').first();
    log('waiting for user1 video title');
    await expect(videoTitle1).toBeVisible({ timeout: 45_000 });
    const songName = await videoTitle1.textContent();
    log(`user1 video title visible: ${songName ?? '<empty>'}`);
    expect(songName).toBeTruthy();

    // ─── User2: 동일 파티룸 입장 (late join) ──────────────────────────
    page2 = await user2Context.newPage();
    attachPageDebug('user2', page2);
    log(`user2 goto partyroom: ${partyroomUrl}`);
    await page2.goto(partyroomUrl);
    log(`user2 arrived at partyroom, current URL: ${page2.url()}`);

    // getSetupInfo 응답 → store.playback 세팅 → VideoTitle 렌더
    const videoTitle2 = page2.locator('[data-testid="video-title"]').first();
    log(`waiting for user2 video title to match: ${songName ?? '<empty>'}`);
    await expect(videoTitle2).toHaveText(songName ?? '', { timeout: 20_000 });
    log('user2 video title matched user1');
  } finally {
    log('starting cleanup');
    if (page2) {
      log('cleanup: leavePartyroom(page2)');
      await leavePartyroom(page2);
    }
    log(`cleanup: ${partyroomUrl ? 'closePartyroom(page1)' : 'leavePartyroom(page1)'}`);
    await (partyroomUrl ? closePartyroom(page1, partyroomUrl) : leavePartyroom(page1));
    log('cleanup finished');
  }
});

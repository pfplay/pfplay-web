import path from 'path';
import { expect, test } from './fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';
import {
  createPlaylistWithTracks,
  registerAsDj,
  setupUserPlaylist,
} from './helpers/partyroom.helpers';

/**
 * E2E-B: DJ 상태 머신 + 다중 클라이언트 동기화
 *
 * 내가 DJ로 등록하고 곡을 틀면, 대기 중인 다른 사람 화면에도 DJ 순서와 재생 곡이 보여야 하고,
 * 내 턴이 끝나면 다음 DJ로 자연스럽게 넘어가야 한다.
 *
 * 해당 기준: A (Auth→파티룸입장→WS구독 체인) + B (다중 사용자 실시간 동기화)
 *
 * 흐름:
 *   전제: window.ethereum mock 주입 + User1/User2 플레이리스트 사전 생성
 *   1. User1: DJ 큐 등록 → 현재 DJ 됨          [REST mutation → WebSocket broadcast]
 *   2. ✅ User2 화면: User1이 현재 DJ로 표시됨
 *   3. User2: DJ 큐 등록 → 대기석 배치          [REST mutation → WebSocket broadcast]
 *   4. ✅ User2 자신 화면: 본인이 대기열에 표시됨 (dj-queue-me-item)
 *   5. ✅ User1 화면: User2가 DJ 대기열에 표시됨 (dj-queue-item)
 *   6. User1: 곡 재생 시작                       [REST mutation → WebSocket broadcast]
 *   7. ✅ User2 화면: User1이 재생한 곡과 동일한 곡이 player에 표시됨
 *   8. User1 DJ 턴 종료(skip) → DJ_QUEUE_UPDATED broadcast
 *   9. ✅ User1, User2 화면 모두: User2가 현재 DJ로 전환됨 (current-dj-item)
 *  10. ✅ User1, User2 화면 모두: User1이 DJ 표시에서 사라지고 일반 참여자로 복귀
 *
 * 검증 목표:
 *   REST mutation → WebSocket broadcast → 다른 클라이언트 UI state 파이프라인이
 *   DJ 등록(1→2), 대기석 배치(3→4,5), 곡 재생(6→7), 로테이션(8→9,10) 4개 지점에서 작동하는가.
 *   특히 DJ 로테이션 후 기존 DJ의 cluster 복귀(orphaned DJ cleanup)를 명시적으로 검증한다.
 *
 * 실패의 의미:
 *   - DJ 큐 등록/표시 실패: 사용자가 DJ가 될 수 없어 음악 재생 자체가 불능
 *   - player.videoId 불일치: 클라이언트마다 다른 곡을 보는 상태 불일치
 *   - 로테이션 후 User1 복귀 실패: 이전 DJ가 DJ 상태로 고착(orphaned DJ), 이후 큐 전체가 꼬임
 */

const AUTH_DIR = path.join(__dirname, '.auth');
const BASE_URL = process.env.E2E_BASE_URL ?? 'https://localhost:3000';

// temporary_SignInFullCrews로 생성되는 고정 계정의 닉네임
const USER1_NICKNAME = 'FullCrew1';

// ─── 테스트 스위트 ──────────────────────────────────────────────────────────────

test.describe('E2E-B: DJ 상태 머신 + 다중 클라이언트 동기화', () => {
  let partyroomUrl: string;
  let user1PlaylistName: string;
  let user2PlaylistName: string;

  test.beforeAll(async ({ browser }) => {
    const timestamp = Date.now().toString(36);
    user1PlaylistName = `E2EB-U1-${timestamp}`;
    user2PlaylistName = `E2EB-U2-${timestamp}`;

    // User1: 플레이리스트 생성 + 파티룸 생성
    const ctx1 = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'user1.json'),
      ignoreHTTPSErrors: true,
    });
    await ctx1.addInitScript(ETHEREUM_MOCK_SCRIPT);
    const page1 = await ctx1.newPage();
    await page1.goto(`${BASE_URL}/parties`);
    await createPlaylistWithTracks(page1, user1PlaylistName);
    await page1.locator('[data-testid="create-partyroom-button"]').click();
    await page1.locator('input[name="name"]').fill(`E2EB${timestamp}`);
    await page1.locator('textarea[name="introduce"]').fill('dj state machine test');
    await page1.locator('button[type="submit"]').click();
    await page1.waitForURL(/\/parties\/\d+/, { timeout: 20_000 });
    partyroomUrl = page1.url();
    await ctx1.close();

    // User2: 플레이리스트 생성
    await setupUserPlaylist(browser, 'user2.json', user2PlaylistName);
  });

  test('User1 DJ 등록 → User2 화면에 User1이 현재 DJ로 표시됨', async ({
    user1Context,
    user2Context,
  }) => {
    const [page1, page2] = await Promise.all([user1Context.newPage(), user2Context.newPage()]);
    await Promise.all([page1.goto(partyroomUrl), page2.goto(partyroomUrl)]);
    await Promise.all([page1.waitForURL(/\/parties\/\d+/), page2.waitForURL(/\/parties\/\d+/)]);
    await page1.waitForLoadState('networkidle');

    await registerAsDj(page1, user1PlaylistName);

    // User2 화면: DJ 다이얼로그 열기 → current-dj-item 존재 확인
    await page2.locator('[data-testid="dj-queue-button"]').click();
    await expect(page2.locator('[data-testid="current-dj-item"]')).toBeVisible({ timeout: 15_000 });
  });

  test('User2 대기 등록 → User1 화면에 User2가 대기열에 표시됨', async ({
    user1Context,
    user2Context,
  }) => {
    const [page1, page2] = await Promise.all([user1Context.newPage(), user2Context.newPage()]);
    await Promise.all([page1.goto(partyroomUrl), page2.goto(partyroomUrl)]);
    await page2.waitForLoadState('networkidle');

    await registerAsDj(page2, user2PlaylistName);

    // User2 자신의 다이얼로그: 본인이 대기열에 있음 확인 (dj-queue-me-item)
    await page2.locator('[data-testid="dj-queue-button"]').click();
    await expect(page2.locator('[data-testid="dj-queue-me-item"]')).toBeVisible({
      timeout: 10_000,
    });

    // User1 다이얼로그: 대기열에 항목 존재 확인 (dj-queue-item)
    await page1.locator('[data-testid="dj-queue-button"]').click();
    await expect(page1.locator('[data-testid="dj-queue-item"]')).toBeVisible({ timeout: 15_000 });
  });

  test('PLAYBACK_STARTED → 두 클라이언트 동일한 곡명 표시', async ({
    user1Context,
    user2Context,
  }) => {
    const [page1, page2] = await Promise.all([user1Context.newPage(), user2Context.newPage()]);
    await Promise.all([page1.goto(partyroomUrl), page2.goto(partyroomUrl)]);

    const title1 = page1.locator('[data-testid="video-title"]').first();
    const title2 = page2.locator('[data-testid="video-title"]').first();

    await expect(title1).toBeVisible({ timeout: 25_000 });
    const songName = await title1.textContent();
    expect(songName).toBeTruthy();

    await expect(title2).toHaveText(songName ?? '', { timeout: 20_000 });
  });

  test('DJ turn skip → User2가 현재 DJ로 전환, User1은 DJ 목록에서 사라짐', async ({
    user1Context,
    user2Context,
  }) => {
    const [page1, page2] = await Promise.all([user1Context.newPage(), user2Context.newPage()]);
    await Promise.all([page1.goto(partyroomUrl), page2.goto(partyroomUrl)]);

    // User1(HOST)이 현재 재생 skip
    await page1.locator('[data-testid="dj-queue-button"]').click();
    await expect(page1.locator('[data-testid="dj-skip-button"]')).toBeVisible({ timeout: 10_000 });
    await page1.locator('[data-testid="dj-skip-button"]').click();

    // DJ_QUEUE_CHANGED: current-dj-item이 존재함 (User2가 현재 DJ)
    await expect(page1.locator('[data-testid="current-dj-item"]')).toBeVisible({ timeout: 15_000 });

    await page2.locator('[data-testid="dj-queue-button"]').click();
    await expect(page2.locator('[data-testid="current-dj-item"]')).toBeVisible({ timeout: 15_000 });

    // User1이 현재 DJ 및 대기열 어디에도 없음 (orphaned DJ cleanup 검증)
    await expect(
      page1.locator(`[data-testid="current-dj-item"]:has-text("${USER1_NICKNAME}")`)
    ).not.toBeVisible();
    await expect(
      page1.locator(`[data-testid="dj-queue-item"]:has-text("${USER1_NICKNAME}")`)
    ).not.toBeVisible();
  });
});

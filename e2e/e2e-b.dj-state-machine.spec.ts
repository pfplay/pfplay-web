import path from 'path';
import { expect, test } from './fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';
import {
  closePartyroom,
  createPlaylistWithTracks,
  registerAsDj,
  setupUserPlaylist,
} from './helpers/partyroom.helpers';

/**
 * E2E-B: DJ 상태 머신 + 다중 클라이언트 동기화
 *
 * 한 사용자가 DJ로 등록되면 다른 사용자 화면에도 현재 DJ가 보이고,
 * 대기 중인 DJ가 등록을 취소하면 대기열 화면에서 사라져야 한다.
 *
 * 해당 기준: A (Auth→파티룸입장→WS구독 체인) + B (다중 사용자 실시간 동기화)
 *
 * 흐름:
 *   전제: window.ethereum mock 주입 + User1/User2 플레이리스트 사전 생성
 *   1. User1: DJ 큐 등록 → 현재 DJ 됨          [REST mutation → WebSocket broadcast]
 *   2. ✅ User2 화면: User1이 현재 DJ로 표시됨
 *   3. User2: DJ 큐 등록 → 대기석 배치          [REST mutation → WebSocket broadcast]
 *   4. ✅ User2 자신 화면: 본인이 대기열에 표시됨 (dj-queue-me-item)
 *   5. User2 DJ 대기 등록 취소 → DJ_QUEUE_UPDATED broadcast
 *   6. ✅ User2 화면: User2가 대기열에서 사라짐
 *
 * 검증 목표:
 *   REST mutation → WebSocket broadcast → 다른 클라이언트 UI state 파이프라인이
 *   DJ 등록(1→2), 대기석 배치(3→4), 대기 취소(5→6) 지점에서 작동하는가.
 *
 * 실패의 의미:
 *   - DJ 큐 등록/표시 실패: 사용자가 DJ가 될 수 없어 음악 재생 자체가 불능
 *   - 대기 취소 후 User2 제거 실패: 취소한 DJ가 대기열에 고착되어 이후 큐 전체가 꼬임
 *
 * 전제:
 *  - 아바타 영역은 신원을 직접 노출하지 않으므로 count로 특정 유저를 추론한다.
 *  - 파티룸에 User1·User2만 존재하는 격리 환경이 전제이며, beforeAll에서 신규 파티룸을 생성해 이를 보장한다.
 */

const AUTH_DIR = path.join(__dirname, '.auth');
const BASE_URL = process.env.E2E_BASE_URL ?? 'https://localhost:3000';

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

  test.afterAll(async ({ browser }) => {
    if (!partyroomUrl) {
      return;
    }

    const ctx = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'user1.json'),
      ignoreHTTPSErrors: true,
    });
    const page = await ctx.newPage();
    await closePartyroom(page, partyroomUrl);
    await ctx.close();
  });

  test('DJ 등록, 대기 등록, 대기 취소가 동기화됨', async ({ user1Context, user2Context }) => {
    test.setTimeout(90_000);

    const [page1, page2] = await Promise.all([user1Context.newPage(), user2Context.newPage()]);
    await Promise.all([page1.goto(partyroomUrl), page2.goto(partyroomUrl)]);
    await Promise.all([
      expect(page1.getByRole('button', { name: /DJ Queue/i })).toBeVisible({ timeout: 15_000 }),
      expect(page2.getByRole('button', { name: /DJ Queue/i })).toBeVisible({ timeout: 15_000 }),
    ]);

    await registerAsDj(page1, user1PlaylistName);

    // User2 화면: 현재 DJ 영역에 정확히 1명 표시
    await expect(page2.locator('[data-testid="partyroom-current-dj"]')).toHaveCount(1, {
      timeout: 15_000,
    });

    await registerAsDj(page2, user2PlaylistName);

    // User2 자신의 화면: DJ Queue 영역에 정확히 1명 표시
    // (User1은 현재 DJ 포지션, User2만 대기열에 있으므로 count=1은 User2임을 보장)
    await expect(page2.locator('[data-testid="partyroom-dj-queue-item"]')).toHaveCount(1, {
      timeout: 15_000,
    });

    const unregisterButton = page2.locator('[data-testid="unregister-dj-queue"]');
    if (!(await unregisterButton.isVisible({ timeout: 3_000 }).catch(() => false))) {
      await page2.locator('[data-testid="dj-queue-button"]').click();
    }
    await expect(page2.locator('[data-testid="unregister-dj-queue"]')).toBeVisible({
      timeout: 10_000,
    });
    await page2.locator('[data-testid="unregister-dj-queue"]').click();
    await page2.getByRole('button', { name: 'Confirm' }).click();

    await expect(page2.locator('[data-testid="partyroom-dj-queue-item"]')).toHaveCount(0, {
      timeout: 15_000,
    });
  });
});

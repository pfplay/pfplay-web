import path from 'path';
import { expect, test } from './fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';

/**
 * E2E-B: DJ 상태 머신 + 다중 클라이언트 동기화
 *
 * 내가 DJ로 등록하고 곡을 틀면, 대기 중인 다른 사람 화면에도 DJ 순서와 재생 곡이 보여야 하고,
 * 내 턴이 끝나면 다음 DJ로 자연스럽게 넘어가야 한다.
 *
 * 해당 기준: A (Auth→파티룸입장→WS구독 체인) + B (다중 사용자 실시간 동기화)
 *
 * 흐름:
 *   1. User1: DJ 큐 등록 → 현재 DJ 됨          [REST mutation → WebSocket broadcast]
 *   2. ✅ User2 화면: User1이 현재 DJ로 표시됨
 *   3. User2: DJ 큐 등록 → 대기석 배치          [REST mutation → WebSocket broadcast]
 *   4. ✅ User1 화면: User2가 DJ 대기열에 표시됨
 *   5. User1: 곡 재생 시작                       [REST mutation → WebSocket broadcast]
 *   6. ✅ User2 화면: User1이 재생한 곡과 동일한 곡이 player에 표시됨
 *   7. User1 DJ 턴 종료(skip) → DJ_QUEUE_UPDATED broadcast
 *   8. ✅ User1, User2 화면 모두: User2가 현재 DJ로 전환됨
 *   9. ✅ User1, User2 화면 모두: User1이 DJ 표시에서 사라지고 일반 참여자로 복귀
 *
 * 검증 목표:
 *   REST mutation → WebSocket broadcast → 다른 클라이언트 UI state 파이프라인이
 *   DJ 등록(1→2), 대기석 배치(3→4), 곡 재생(5→6), 로테이션(7→8,9) 4개 지점에서 작동하는가.
 *   특히 DJ 로테이션 후 기존 DJ의 cluster 복귀(orphaned DJ cleanup)를 명시적으로 검증한다.
 *
 * 실패의 의미:
 *   - DJ 큐 등록/표시 실패: 사용자가 DJ가 될 수 없어 음악 재생 자체가 불능
 *   - player.videoId 불일치: 클라이언트마다 다른 곡을 보는 상태 불일치
 *   - 로테이션 후 User1 복귀 실패: 이전 DJ가 DJ 상태로 고착(orphaned DJ), 이후 큐 전체가 꼬임
 */

const AUTH_DIR = path.join(__dirname, '.auth');
const BASE_URL = process.env.E2E_BASE_URL ?? 'https://localhost:3000';

// temporary_SignInFullCrew / temporary_SignInAssociateCrew로 생성되는 고정 계정의 닉네임
const USER1_NICKNAME = 'FullCrew';
const USER2_NICKNAME = 'AssociateCrew';

async function createPartyroomAsUser1(
  browser: import('@playwright/test').Browser
): Promise<string> {
  const ctx = await browser.newContext({
    storageState: path.join(AUTH_DIR, 'user1.json'),
    ignoreHTTPSErrors: true,
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/parties`);
  await page.locator('[data-testid="create-partyroom-button"]').click();
  await page.locator('input[name="name"]').fill(`E2E-B ${Date.now()}`);
  await page.locator('textarea[name="introduce"]').fill('dj state machine test');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/parties\/\d+/, { timeout: 20_000 });
  const url = page.url();
  await ctx.close();
  return url;
}

test.describe('E2E-B: DJ 상태 머신 + 다중 클라이언트 동기화', () => {
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    partyroomUrl = await createPartyroomAsUser1(browser);
  });

  test('User1 DJ 등록 → User2 화면에 User1이 현재 DJ로 표시됨', async ({
    user1Context,
    user2Context,
  }) => {
    const [page1, page2] = await Promise.all([user1Context.newPage(), user2Context.newPage()]);
    await Promise.all([page1.goto(partyroomUrl), page2.goto(partyroomUrl)]);
    await Promise.all([page1.waitForURL(/\/parties\/\d+/), page2.waitForURL(/\/parties\/\d+/)]);

    // User1: DJ 등록
    await page1.locator('[data-testid="dj-queue-button"]').click();
    await expect(page1.locator('[data-testid="register-dj-queue"]')).toBeVisible({
      timeout: 10_000,
    });
    await page1.locator('[data-testid="register-dj-queue"]').click();
    await expect(page1.locator('[role="dialog"] li').first()).toBeVisible({ timeout: 5_000 });
    await page1.locator('[role="dialog"] li').first().click();
    await page1.locator('[role="dialog"] button:has-text("Confirm")').click();

    // User2 DJ dialog 열기 → DJ_QUEUE_CHANGED로 User1이 현재 DJ로 표시
    await page2.locator('[data-testid="dj-queue-button"]').click();
    await expect(page2.locator('[role="dialog"]').getByText(USER1_NICKNAME)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('User2 대기 등록 → User1 화면에 User2가 대기열에 표시됨', async ({
    user1Context,
    user2Context,
  }) => {
    const [page1, page2] = await Promise.all([user1Context.newPage(), user2Context.newPage()]);
    await Promise.all([page1.goto(partyroomUrl), page2.goto(partyroomUrl)]);

    // User2: DJ 대기 등록
    await page2.locator('[data-testid="dj-queue-button"]').click();
    await expect(page2.locator('[data-testid="register-dj-queue"]')).toBeVisible({
      timeout: 10_000,
    });
    await page2.locator('[data-testid="register-dj-queue"]').click();
    await expect(page2.locator('[role="dialog"] li').first()).toBeVisible({ timeout: 5_000 });
    await page2.locator('[role="dialog"] li').first().click();
    await page2.locator('[role="dialog"] button:has-text("Confirm")').click();

    // User2 자신의 dialog: 'Me' 태그 표시 (대기열에 자신이 있음을 확인)
    await expect(page2.locator('[role="dialog"]').getByText('Me')).toBeVisible({
      timeout: 10_000,
    });

    // User1 dialog: User2 닉네임이 대기열에 표시 (DJ_QUEUE_CHANGED broadcast)
    await page1.locator('[data-testid="dj-queue-button"]').click();
    await expect(page1.locator('[role="dialog"]').getByText(USER2_NICKNAME)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('PLAYBACK_STARTED → 두 클라이언트 동일한 곡명 표시', async ({
    user1Context,
    user2Context,
  }) => {
    const [page1, page2] = await Promise.all([user1Context.newPage(), user2Context.newPage()]);
    await Promise.all([page1.goto(partyroomUrl), page2.goto(partyroomUrl)]);

    const title1 = page1.locator('[data-testid="video-title"]');
    const title2 = page2.locator('[data-testid="video-title"]');

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
    await expect(page1.locator('[data-testid="dj-skip-button"]')).toBeVisible({
      timeout: 10_000,
    });
    await page1.locator('[data-testid="dj-skip-button"]').click();

    // DJ_QUEUE_CHANGED: User2가 현재 DJ로 전환
    await expect(page1.locator('[role="dialog"]').getByText(USER2_NICKNAME)).toBeVisible({
      timeout: 15_000,
    });

    await page2.locator('[data-testid="dj-queue-button"]').click();
    await expect(page2.locator('[role="dialog"]').getByText(USER2_NICKNAME)).toBeVisible({
      timeout: 15_000,
    });

    // User1이 DJ 목록에서 사라짐 (orphaned DJ cleanup 검증)
    await expect(page1.locator('[role="dialog"]').getByText(USER1_NICKNAME)).not.toBeVisible();
  });
});

import path from 'path';
import { expect, test } from './fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';

/**
 * E2E-B: DJ 상태 머신 + 다중 클라이언트 동기화
 *
 * REST→WS 파이프라인 4개 지점 검증:
 * 1. User1 DJ 등록 → User2 화면에 User1이 현재 DJ로 표시
 * 2. User2 DJ 대기 등록 → User1 화면에 User2가 대기열에 표시
 * 3. PLAYBACK_STARTED → 두 클라이언트 모두 동일한 곡명
 * 4. User1 turn skip → 두 클라이언트 모두 User2가 현재 DJ로 전환, User1은 일반 크루 복귀
 *
 * 기준: A (Auth→파티룸입장→WS구독 체인) + B (다중 사용자 실시간 동기화)
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

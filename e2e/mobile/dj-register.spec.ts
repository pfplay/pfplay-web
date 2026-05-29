import path from 'path';
import { type Browser, type BrowserContext, devices, expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';
import { closePartyroom, createPartyroom } from '../helpers/partyroom.helpers';

const AUTH_DIR = path.join(__dirname, '../.auth');

async function newDesktopUserContext(browser: Browser, authFile: string): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    ...devices['Desktop Chrome'],
    storageState: path.join(AUTH_DIR, authFile),
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  return ctx;
}

test.describe('mobile DJ register flow', () => {
  let desktopCtx: BrowserContext;
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    desktopCtx = await newDesktopUserContext(browser, 'a-user1.json');
    const setupPage = await desktopCtx.newPage();
    partyroomUrl = await createPartyroom(
      setupPage,
      `MDJ${Date.now().toString(36)}`,
      'mobile dj register'
    );
    await setupPage.close();
  });

  test.afterAll(async () => {
    if (desktopCtx) {
      const cleanupPage = await desktopCtx.newPage();
      await closePartyroom(cleanupPage, partyroomUrl);
      await cleanupPage.close();
      await desktopCtx.close();
    }
  });

  test('모바일 멤버 → 룸 입장 → 큐 탭 → [+ DJ 등록] → SelectPlaylistSheet → 선택 → 큐 리스트에 Me → [큐에서 나가기]', async ({
    page,
  }) => {
    await page.goto(partyroomUrl);
    await page.getByTestId('mobile-tab-queue').click();
    await page.getByTestId('member-action-register').click();
    const firstCard = page.getByTestId(/^mobile-playlist-card-\d+$/).first();
    await firstCard.click();
    await page.getByTestId('select-playlist-confirm').click();
    await expect(page.getByText(/Me/)).toBeVisible();
    await page.getByTestId('member-action-unregister').click();
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByTestId('member-action-register')).toBeVisible();
  });
});

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

test.describe('mobile add-tracks flow', () => {
  let desktopCtx: BrowserContext;
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    desktopCtx = await newDesktopUserContext(browser, 'a-user1.json');
    const setupPage = await desktopCtx.newPage();
    partyroomUrl = await createPartyroom(
      setupPage,
      `MAT${Date.now().toString(36)}`,
      'mobile add tracks'
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

  test('모바일 멤버 → 큐 탭 → 빈 플레이리스트의 [+ 곡 추가] → AddTracksSheet → 검색 → ▶ 미리듣기 → [+ 추가] → mini-player 유지', async ({
    page,
  }) => {
    await page.goto(partyroomUrl);
    await page.getByTestId('mobile-tab-queue').click();
    await page.getByTestId('member-action-register').click();
    // 빈 플레이리스트 카드의 [+ 곡 추가] CTA 클릭 (테스트는 정상/빈 분기 둘 다 가능 — 빈 카드 우선)
    const emptyCardCta = page.getByTestId(/^mobile-playlist-card-\d+-add-tracks$/).first();
    await emptyCardCta.click();
    // AddTracksSheet 노출 → 검색
    await page.getByTestId('music-search-input').fill('test song');
    // 결과 ▶ 클릭 (첫 곡)
    const firstPreview = page.getByTestId(/^search-item-preview-/).first();
    await firstPreview.click();
    // mini-player 노출
    await expect(page.getByTestId('mini-player-name')).toBeVisible();
    // [+ 추가] 클릭
    await page.getByTestId('mini-player-add').click();
    // mini-player 여전히 유지
    await expect(page.getByTestId('mini-player-name')).toBeVisible();
  });
});

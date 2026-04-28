import path from 'path';
import { Browser } from '@playwright/test';
import { test as setup, expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';

const AUTH_DIR = path.join(__dirname, '.auth');

async function authenticateUser(browser: Browser, outputPath: string, baseURL: string) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  });
  const page = await context.newPage();
  await page.addInitScript(ETHEREUM_MOCK_SCRIPT);
  await page.goto(`${baseURL}/sign-in`);

  const devBtn = page.locator('[data-testid="dev-sign-in-button"]');
  await expect(devBtn).toBeVisible({ timeout: 10_000 });
  await devBtn.click();
  await page.locator('[data-testid="dev-sign-in-full"]').click();

  await page.waitForURL(/\/(parties|$)/, { timeout: 30_000 });
  const pfpPlayButton = page.locator('[data-testid="home-pfp-play-button"]');
  if (await pfpPlayButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await page.goto(`${baseURL}/parties`);
    await page.waitForURL(/\/parties/, { timeout: 10_000 });
  }
  await context.storageState({ path: outputPath });
  await page.close();
  await context.close();
}

setup('authenticate A User1 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'a-user1.json'), baseURL ?? '');
});

setup('authenticate A User2 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'a-user2.json'), baseURL ?? '');
});

setup('authenticate B User1 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'b-user1.json'), baseURL ?? '');
});

setup('authenticate B User2 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'b-user2.json'), baseURL ?? '');
});

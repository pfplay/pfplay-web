import path from 'path';
import { Browser } from '@playwright/test';
import { test as setup, expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';

const AUTH_DIR = path.join(__dirname, '.auth');

async function authenticateUser(browser: Browser, outputPath: string, baseURL: string) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
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

setup('authenticate User1 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'user1.json'), baseURL ?? '');
});

setup('authenticate User2 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'user2.json'), baseURL ?? '');
});

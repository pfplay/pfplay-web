import path from 'path';
import { BrowserContext } from '@playwright/test';
import { test as setup, expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';

const AUTH_DIR = path.join(__dirname, '.auth');

/**
 * 소셜 로그인 없이 두 사용자의 인증 상태를 저장한다.
 */
async function authenticateUser(
  browserContext: BrowserContext,
  role: 'full' | 'associate',
  outputPath: string,
  baseURL: string
) {
  const page = await browserContext.newPage();
  await page.addInitScript(ETHEREUM_MOCK_SCRIPT);
  await page.goto(`${baseURL}/sign-in`);

  const devBtn = page.locator('[data-testid="dev-sign-in-button"]');
  await expect(devBtn).toBeVisible({ timeout: 10_000 });
  await devBtn.click();

  const roleTestId = role === 'full' ? 'dev-sign-in-full' : 'dev-sign-in-associate';
  await page.locator(`[data-testid="${roleTestId}"]`).click();

  await page.waitForURL(/\/parties/, { timeout: 30_000 });
  await expect(page).toHaveURL(/\/parties/);
  await browserContext.storageState({ path: outputPath });
  await page.close();
}

setup('authenticate User1 (full crew = HOST)', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  await authenticateUser(context, 'full', path.join(AUTH_DIR, 'user1.json'), baseURL ?? '');
  await context.close();
});

setup('authenticate User2 (associate crew)', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  await authenticateUser(context, 'associate', path.join(AUTH_DIR, 'user2.json'), baseURL ?? '');
  await context.close();
});

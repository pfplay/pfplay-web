import path from 'path';
import { Browser, Locator, Page, expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';

export const AUTH_DIR = path.join(__dirname, '../.auth');

async function waitForDialogToSettle(dialog: Locator) {
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  await expect
    .poll(
      async () =>
        dialog.evaluate((element) =>
          element
            .getAnimations({ subtree: true })
            .every(
              (animation) => animation.playState === 'finished' || animation.playState === 'idle'
            )
        ),
      { timeout: 5_000 }
    )
    .toBe(true);
}

async function clickDevFullCrewSignIn(page: Page) {
  const devBtn = page.locator('[data-testid="dev-sign-in-button"]');
  await expect(devBtn).toBeVisible({ timeout: 10_000 });
  await expect(devBtn).toBeEnabled({ timeout: 10_000 });
  await devBtn.click();

  const dialog = page
    .locator('[data-testid="dialog-panel"]')
    .filter({ has: page.locator('[data-testid="dev-sign-in-full"]') })
    .first();
  await waitForDialogToSettle(dialog);

  const fullCrewButton = dialog.locator('[data-testid="dev-sign-in-full"]');
  await expect(fullCrewButton).toBeVisible({ timeout: 10_000 });
  await expect(fullCrewButton).toBeEnabled({ timeout: 10_000 });
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/v1/users/members/sign/temporary/full-member') &&
        response.ok(),
      { timeout: 10_000 }
    ),
    fullCrewButton.click({ force: true }),
  ]);
  await expect(dialog).toBeHidden({ timeout: 10_000 });
}

export async function authenticateUser(browser: Browser, outputPath: string, baseURL: string) {
  const startedAt = Date.now();
  const authLabel = path.basename(outputPath, '.json');
  const log = (message: string) => {
    const elapsed = `${Date.now() - startedAt}ms`.padStart(8, ' ');
    console.log(`[AUTH][${authLabel}][${elapsed}] ${message}`);
  };

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      log(`console.${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    log(`pageerror: ${error.message}`);
  });
  page.on('close', () => {
    log('page closed');
  });
  page.on('crash', () => {
    log('page crashed');
  });
  await page.addInitScript(ETHEREUM_MOCK_SCRIPT);
  log(`goto ${baseURL}/sign-in`);
  await page.goto(`${baseURL}/sign-in`);

  log('waiting for dev sign-in button');
  log('clicking full crew sign-in');
  await clickDevFullCrewSignIn(page);

  log('goto /parties explicitly after sign-in response');
  await page.goto(`${baseURL}/parties`);
  await page.waitForURL(/\/parties(?:$|\/)/, { timeout: 10_000 });
  log(`arrived at /parties, current URL: ${page.url()}`);
  log(`writing storageState to ${outputPath}`);
  await context.storageState({ path: outputPath });
  log('storageState written');
  await page.close();
  await context.close();
  log('context closed');
}

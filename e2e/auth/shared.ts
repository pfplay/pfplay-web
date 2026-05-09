import path from 'path';
import { Browser, Page, expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';

export const AUTH_DIR = path.join(__dirname, '../.auth');

async function clickDevFullCrewSignIn(page: Page) {
  const devBtn = page.locator('[data-testid="dev-sign-in-button"]');
  await expect(devBtn).toBeVisible({ timeout: 10_000 });
  await expect(devBtn).toBeEnabled({ timeout: 10_000 });
  await devBtn.click({ force: true });

  const dialog = page
    .locator('[data-testid="dialog-panel"]')
    .filter({ has: page.locator('[data-testid="dev-sign-in-full"]') })
    .first();
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  const fullCrewButton = dialog.locator('[data-testid="dev-sign-in-full"]');
  await expect(fullCrewButton).toBeVisible({ timeout: 10_000 });
  await expect(fullCrewButton).toBeEnabled({ timeout: 10_000 });
  await fullCrewButton.click({ force: true });
  await expect(dialog).toBeHidden({ timeout: 15_000 });
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

  log('goto /parties explicitly after dialog closed');
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

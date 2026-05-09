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
  await fullCrewButton.click({ force: true });
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

  const pfpPlayButton = page.locator('[data-testid="home-pfp-play-button"]');
  log('waiting until page is effectively ready for /parties');
  await expect
    .poll(
      async () => {
        if (/\/parties(?:$|\/)/.test(page.url())) {
          return 'ready';
        }

        if (await pfpPlayButton.isVisible().catch(() => false)) {
          return (await pfpPlayButton.getAttribute('href')) === '/parties' ? 'ready' : 'waiting';
        }

        return 'waiting';
      },
      { timeout: 30_000 }
    )
    .toBe('ready');
  log(`page became ready, current URL: ${page.url()}`);

  if (!/\/parties(?:$|\/)/.test(page.url())) {
    log('goto /parties explicitly');
    await page.goto(`${baseURL}/parties`);
    await page.waitForURL(/\/parties/, { timeout: 10_000 });
    log(`arrived at /parties, current URL: ${page.url()}`);
  }
  log(`writing storageState to ${outputPath}`);
  await context.storageState({ path: outputPath });
  log('storageState written');
  await page.close();
  await context.close();
  log('context closed');
}

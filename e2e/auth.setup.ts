import path from 'path';
import { Browser } from '@playwright/test';
import { test as setup, expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';

const AUTH_DIR = path.join(__dirname, '.auth');

async function authenticateUser(browser: Browser, outputPath: string, baseURL: string) {
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

  const devBtn = page.locator('[data-testid="dev-sign-in-button"]');
  log('waiting for dev sign-in button');
  await expect(devBtn).toBeVisible({ timeout: 10_000 });
  log('clicking dev sign-in button');
  await devBtn.click();
  log('clicking full crew sign-in');
  await page.locator('[data-testid="dev-sign-in-full"]').click();

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

import path from 'path';
import { Browser, Page, expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';

export const AUTH_DIR = path.join(__dirname, '../.auth');

// web#303: cold-start(Vercel preview 함수 cold) 시 첫 히트가 느려 기존 10s
// 대기로는 한 번의 느린 응답에도 깨졌다. 30s 로 상향해 cold 첫 히트를 흡수.
const STEP_TIMEOUT = 30_000;

async function clickDevFullCrewSignIn(page: Page) {
  const devBtn = page.locator('[data-testid="dev-sign-in-button"]');
  await expect(devBtn).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(devBtn).toBeEnabled({ timeout: STEP_TIMEOUT });
  await devBtn.click({ force: true });

  const dialog = page
    .locator('[data-testid="dialog-panel"]')
    .filter({ has: page.locator('[data-testid="dev-sign-in-full"]') })
    .first();
  await expect(dialog).toBeVisible({ timeout: STEP_TIMEOUT });

  const fullCrewButton = dialog.locator('[data-testid="dev-sign-in-full"]');
  await expect(fullCrewButton).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(fullCrewButton).toBeEnabled({ timeout: STEP_TIMEOUT });
  await fullCrewButton.click({ force: true });
  await expect(dialog).toBeHidden({ timeout: STEP_TIMEOUT });
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
  // web#303 D: console.error 의 `Failed to load resource: 401 ()` 는 URL 이
  // 빠져 어느 요청인지 단정 불가했다. 네트워크 레벨(method+URL)로 직접 로깅해
  // 향후 실패를 결정적으로 진단 (status>=400 만 — 노이즈 억제).
  page.on('response', (res) => {
    if (res.status() >= 400) {
      log(`HTTP ${res.status()} ${res.request().method()} ${res.url()}`);
    }
  });
  page.on('requestfailed', (req) => {
    log(`REQ_FAILED ${req.method()} ${req.url()} :: ${req.failure()?.errorText ?? 'unknown'}`);
  });
  await page.addInitScript(ETHEREUM_MOCK_SCRIPT);
  log(`goto ${baseURL}/sign-in`);
  await page.goto(`${baseURL}/sign-in`);

  log('waiting for dev sign-in button');
  log('clicking full crew sign-in');
  await clickDevFullCrewSignIn(page);

  // web#303 A: storageState 기록 전 "인증이 실제 성공" 을 authed /me/info 200
  // 으로 검증. sign-in POST 가 사전인증-401 redirect 로 abort 되면 200 이
  // 안 와 30s 후 throw → 미인증 storageState 사일런트 기록을 차단(fail-loud).
  // 재시도 없음 — 진짜 sign-in 회귀를 은폐하지 않기 위함.
  log('waiting for authenticated GET /me/info 200');
  await page.waitForResponse(
    (res) =>
      res.url().includes('/v1/users/me/info') &&
      res.request().method() === 'GET' &&
      res.status() === 200,
    { timeout: 30_000 }
  );
  log('authenticated (me/info 200) — navigating to /parties');
  await page.goto(`${baseURL}/parties`);
  await page.waitForURL(/\/parties(?:$|[/?#])/, { timeout: 30_000 });
  log(`arrived at /parties, current URL: ${page.url()}`);
  log(`writing storageState to ${outputPath}`);
  await context.storageState({ path: outputPath });
  log('storageState written');
  await page.close();
  await context.close();
  log('context closed');
}

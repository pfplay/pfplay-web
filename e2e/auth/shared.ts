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

  log('goto /parties explicitly after dialog closed');
  // web#303: dev-crew 로그인 직후 me-fetch 가 아직 pending 이면 ProtectedLayout
  // 가드가 미인증으로 오판해 `/` 로 바운스한다(= createPlaylistWithTracks 의
  // "navigated to /" 와 동일 메커니즘). 제품측 근본 해결(ProtectedLayout 이
  // me-pending 중 하드리다이렉트 안 하기)은 **B 로 후속 분리**. 여기선
  // 테스트 레벨 방어: storageState 쿠키 인증은 유효하므로 `/` 로 바운스되면
  // me 안정 후 재진입하면 /parties 가 유지된다. 최대 3회 재시도.
  const partiesUrl = /\/parties(?:$|[/?#])/;
  let onParties = false;
  for (let attempt = 0; attempt < 3 && !onParties; attempt++) {
    if (!partiesUrl.test(page.url())) {
      await page.goto(`${baseURL}/parties`);
    }
    try {
      await page.waitForURL(partiesUrl, { timeout: STEP_TIMEOUT });
      onParties = true;
    } catch {
      log(`/parties bounced to ${page.url()} (attempt ${attempt + 1}) — retrying`);
      await page.goto(`${baseURL}/parties`);
    }
  }
  log(`arrived at /parties, current URL: ${page.url()}`);
  log(`writing storageState to ${outputPath}`);
  await context.storageState({ path: outputPath });
  log('storageState written');
  await page.close();
  await context.close();
  log('context closed');
}

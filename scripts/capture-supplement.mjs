// 보충 캡처: 버그 신고 다이얼로그 + 언어 변경 메뉴 (헤더 아이콘이 직접 보이는 settings 헤더 이용).
import { chromium, devices } from '@playwright/test';
import path from 'path';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'mobile-screenshots');
const iPhone = devices['iPhone 13'];
const log = (m) => console.log(`[supp] ${m}`);
const HIDE = `.tsqd-parent-container,#__next-build-watcher,nextjs-portal,[data-nextjs-toast],[data-next-badge-root]{display:none!important;}`;

async function shot(page, file, full = false) {
  await page.addStyleTag({ content: HIDE }).catch(() => null);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, file), fullPage: full });
  log(`✓ ${file}`);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...iPhone, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  // associate(AM) dev 로그인 → /settings/profile (globe + 🐛 헤더 노출 확인됨)
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="dev-sign-in-button"]').click({ force: true });
  const dialog = page.locator('[data-testid="dialog-panel"]')
    .filter({ has: page.locator('[data-testid="dev-sign-in-associate"]') }).first();
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  await dialog.locator('[data-testid="dev-sign-in-associate"]').click({ force: true });
  await page.waitForURL(/\/settings\/profile/, { timeout: 30000 });
  await page.getByTestId('mobile-profile-form').waitFor({ timeout: 30000 });
  await page.addStyleTag({ content: HIDE }).catch(() => null);

  // 1) 버그 신고 다이얼로그
  try {
    await page.getByTestId('bug-report-button').click({ force: true });
    await page.waitForTimeout(1000);
    await shot(page, '23-bug-report-dialog.png');
    await page.keyboard.press('Escape').catch(() => null);
    await page.waitForTimeout(500);
  } catch (e) {
    log(`✗ bug-report: ${e.message.split('\n')[0]}`);
  }

  // 2) 언어 변경 메뉴 (헤더에서 bug 버튼이 아닌 globe 버튼 클릭)
  try {
    // 헤더 영역 버튼들 중 bug-report-button 직전 버튼이 globe(LanguageChangeMenu).
    const headerButtons = page.locator('header button, [class*="header"] button, [class*="Header"] button');
    const cnt = await headerButtons.count();
    log(`header buttons: ${cnt}`);
    // bug-report-button 의 형제/인접 — 모든 버튼 순회하며 testid 가 bug 가 아니고 svg 포함한 것 클릭
    let clicked = false;
    for (let i = 0; i < cnt; i++) {
      const b = headerButtons.nth(i);
      const tid = await b.getAttribute('data-testid').catch(() => null);
      if (tid === 'bug-report-button') continue;
      const hasSvg = await b.locator('svg').count().catch(() => 0);
      if (hasSvg > 0) {
        await b.click({ force: true });
        clicked = true;
        break;
      }
    }
    if (clicked) {
      await page.waitForTimeout(900);
      await shot(page, '24-language-menu.png');
    } else {
      log('globe 버튼 못 찾음');
    }
  } catch (e) {
    log(`✗ language-menu: ${e.message.split('\n')[0]}`);
  }

  await browser.close();
  log('완료');
})().catch((e) => { console.error('FATAL', e); process.exit(1); });

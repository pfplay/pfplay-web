// 수정 반영 재캡처: 폼 오버플로우 fix(07/19) + 썸네일(15) + 트랙 추가 후 상세(13) +
// 등록된 DJ 상태 큐 탭(10) + 중앙정렬 액션버튼(08/09/10) + 선택 시트(16) + 플리관리(11).
// 기존 final 세트의 해당 파일만 덮어쓴다.
import { chromium, devices } from '@playwright/test';
import path from 'path';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API = process.env.E2E_API_BASE || 'http://localhost:8080/api/';
const OUT = path.join(process.cwd(), 'mobile-screenshots');
const iPhone = devices['iPhone 13'];
const log = (m) => console.log(`[fix] ${m}`);
const HIDE = `.tsqd-parent-container,#__next-build-watcher,nextjs-portal,[data-nextjs-toast],[data-next-badge-root]{display:none!important;}`;

async function shot(page, file, full = false) {
  await page.addStyleTag({ content: HIDE }).catch(() => null);
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => null);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, file), fullPage: full });
  log(`✓ ${file}`);
}
async function safe(label, fn) {
  try { await fn(); } catch (e) { log(`✗ SKIP ${label}: ${e.message.split('\n')[0]}`); }
}
async function devLogin(page, variant) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
  const open = page.locator('[data-testid="dev-sign-in-button"]');
  await open.waitFor({ state: 'visible', timeout: 45000 });
  await open.click({ force: true });
  const tid = variant === 'full' ? 'dev-sign-in-full' : 'dev-sign-in-associate';
  const dialog = page.locator('[data-testid="dialog-panel"]').filter({ has: page.locator(`[data-testid="${tid}"]`) }).first();
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  if (variant === 'full') {
    const me = page.waitForResponse((r) => r.url().includes('/users/me/info') && r.request().method() === 'GET' && r.status() === 200, { timeout: 30000 });
    await dialog.locator(`[data-testid="${tid}"]`).click({ force: true });
    await me;
  } else {
    await dialog.locator(`[data-testid="${tid}"]`).click({ force: true });
  }
}

(async () => {
  const browser = await chromium.launch();
  const member = await browser.newContext({ ...iPhone, ignoreHTTPSErrors: true });
  const mp = await member.newPage();
  mp.on('console', (m) => m.type() === 'error' && log(`  [err] ${m.text().slice(0, 100)}`));

  let roomUrl = null;

  await safe('login', () => devLogin(mp, 'full'));

  // stale cap 룸 정리
  await safe('cleanup', async () => {
    const res = await member.request.get(new URL('v1/partyrooms', API).toString());
    if (res.ok()) {
      const body = await res.json();
      const list = Array.isArray(body) ? body : body?.data ?? body?.content ?? [];
      for (const r of list) if (/^cap|screenshot|capture|디자인/i.test(r.title || ''))
        await member.request.delete(new URL(`v1/partyrooms/${r.partyroomId}`, API).toString()).catch(() => null);
    }
  });

  // 07: 파티 개설 다이얼로그 (오버플로우 fix 확인)
  await safe('create-dialog(07)', async () => {
    await mp.goto(`${BASE}/parties`, { waitUntil: 'domcontentloaded' });
    await mp.getByTestId('mobile-create-partyroom-button').click();
    await mp.locator('input[name="name"]').waitFor({ timeout: 15000 });
    await shot(mp, '07-member-create-party-dialog.png');
  });

  // 룸 생성은 API 로 직접 (UI 제출 경로는 캡처 안정성과 무관 — 룸 내부 화면 확보가 목적)
  await safe('create-room(api)', async () => {
    const res = await member.request.post(new URL('v1/partyrooms', API).toString(), {
      data: {
        title: `cap${Date.now().toString(36).slice(-6)}`,
        introduction: '디자인 외주용 캡처 룸',
        playbackTimeLimit: 7,
      },
    });
    if (!res.ok()) throw new Error(`create HTTP ${res.status()}: ${(await res.text()).slice(0, 120)}`);
    const body = await res.json();
    const id = body?.data?.partyroomId ?? body?.partyroomId; // 응답은 { data: { partyroomId } } 봉투
    if (!id) throw new Error(`partyroomId 없음: ${JSON.stringify(body).slice(0, 120)}`);
    roomUrl = `${BASE}/parties/${id}`;
    log(`room ${roomUrl}`);
  });

  if (roomUrl) {
    await safe('enter', async () => {
      await mp.goto(roomUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await mp.getByTestId('mobile-tab-queue').waitFor({ timeout: 60000 });
      await mp.addStyleTag({ content: HIDE }).catch(() => null);
      await mp.waitForTimeout(3000);
    });

    // 플리 관리 → 카드 열기 → 곡 추가(검색 15) → 상세(13, 트랙+썸네일)
    await safe('playlist + add track', async () => {
      await mp.getByTestId('mobile-tab-queue').click();
      await mp.getByTestId('member-action-manage-playlists').click();
      await mp.getByTestId('manage-create-cta').waitFor({ timeout: 15000 });
      await shot(mp, '11-playlist-manage.png');

      const card = mp.locator('[data-testid^="manage-playlist-card-"]').first();
      await card.waitFor({ timeout: 10000 });
      await card.click();
      await mp.getByTestId('detail-add-tracks').waitFor({ timeout: 15000 });

      // L3 검색 → 썸네일 확인(15) → 첫 곡 추가
      await mp.getByTestId('detail-add-tracks').click();
      const search = mp.getByTestId('music-search-input');
      await search.waitFor({ timeout: 10000 });
      await search.fill('test song');
      await mp.getByTestId(/^search-item-add-/).first().waitFor({ timeout: 15000 });
      await mp.waitForTimeout(1200);
      await shot(mp, '15-add-tracks-search-results.png');
      await mp.getByTestId(/^search-item-add-/).first().click();
      await mp.waitForTimeout(1500);

      // 뒤로 → 상세에 트랙 노출(13)
      await mp.getByTestId('fullscreen-sheet-back').click();
      await mp.getByTestId(/^detail-track-remove-/).first().waitFor({ timeout: 15000 });
      await shot(mp, '13-playlist-detail.png');
    });

    // 시트 닫고 DJ 등록 → 선택 시트(16) → 확정 → 가이드 dismiss → DJ 활성
    await safe('register dj', async () => {
      await mp.goto(roomUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await mp.getByTestId('mobile-tab-queue').waitFor({ timeout: 30000 });
      await mp.addStyleTag({ content: HIDE }).catch(() => null);
      await mp.getByTestId('mobile-tab-queue').click();
      await mp.getByTestId('member-action-register').click();
      await mp.locator('[data-testid^="mobile-playlist-card-"]').first().waitFor({ timeout: 15000 });
      await shot(mp, '16-dj-register-select-playlist.png');

      const enabled = mp.locator('[data-testid^="mobile-playlist-card-"]:not([data-testid$="-add-tracks"]):not([disabled])').first();
      await enabled.click();
      const confirm = mp.getByTestId('select-playlist-confirm');
      await confirm.waitFor({ timeout: 10000 });
      if (await confirm.isEnabled()) {
        await confirm.click();
        await safe('guide', async () => {
          await mp.getByTestId('guide-start').waitFor({ timeout: 15000 });
          await mp.getByTestId('guide-start').click();
        });
        await mp.getByTestId('member-action-unregister').waitFor({ timeout: 20000 }).catch(() => null);
        await mp.waitForTimeout(3000);
      }
    });

    // 10: DJ 등록된 상태 큐 탭 (중앙정렬 액션버튼 포함)
    await safe('queue(10)', async () => {
      await mp.getByTestId('mobile-tab-queue').click();
      await mp.waitForTimeout(1500);
      await shot(mp, '10-room-queue-tab.png');
    });
    // 08/09: 채팅·크루 탭 (중앙정렬 확인)
    await safe('chat(08)', async () => {
      await mp.getByTestId('mobile-tab-chat').click();
      await mp.waitForTimeout(1200);
      await shot(mp, '08-room-chat-tab.png');
    });
    await safe('crew(09)', async () => {
      await mp.getByTestId('mobile-tab-crew').click();
      await mp.waitForTimeout(1200);
      await shot(mp, '09-room-crew-tab.png');
    });
  }

  // 19: 프로필 온보딩 (vertical fix)
  const am = await browser.newContext({ ...iPhone, ignoreHTTPSErrors: true });
  const ap = await am.newPage();
  await safe('profile(19)', async () => {
    await devLogin(ap, 'associate');
    await ap.waitForURL(/\/settings\/profile/, { timeout: 30000 });
    await ap.getByTestId('mobile-profile-form').waitFor({ timeout: 30000 });
    await shot(ap, '19-profile-onboarding-new-member.png', true);
  });

  // 룸 정리
  if (roomUrl) await safe('cleanup-room', async () => {
    const id = roomUrl.match(/\/parties\/(\d+)/)?.[1];
    if (id) await member.request.delete(new URL(`v1/partyrooms/${id}`, API).toString()).catch(() => null);
  });

  await browser.close();
  log('완료');
})().catch((e) => { console.error('FATAL', e); process.exit(1); });

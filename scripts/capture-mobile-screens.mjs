// 모바일 웹 뷰 전체 화면 스크린샷 캡처 (디자인 외주용).
// iPhone 13 device descriptor 로 진짜 모바일 UA → middleware x-pf-device=mobile 보장.
// 게스트 / 정회원(full crew) / 신규 준회원(AM 온보딩) 3 상태 + 룸 내부 시트/모달까지.
//
// 실행: BASE / API inline 후 node scripts/capture-mobile-screens.mjs
import { chromium, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API = process.env.E2E_API_BASE || 'http://localhost:8080/api/';
const OUT = path.join(process.cwd(), 'mobile-screenshots');
fs.mkdirSync(OUT, { recursive: true });

const iPhone = devices['iPhone 13'];
let n = 0;
const log = (m) => console.log(`[capture] ${m}`);

// dev 전용 오버레이(React Query Devtools / Next dev indicator) 가리기 — prod 빌드엔 없음.
const HIDE_DEV_OVERLAYS = `
  .tsqd-parent-container, #__next-build-watcher, nextjs-portal,
  [data-nextjs-toast], [data-next-badge-root], #__next-dev-overlay { display:none !important; }
`;

async function prep(page) {
  await page.addStyleTag({ content: HIDE_DEV_OVERLAYS }).catch(() => null);
  // 폰트/이미지 안정화 대기
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => null);
  await page.addStyleTag({ content: HIDE_DEV_OVERLAYS }).catch(() => null);
}

async function shot(page, name, { full = true } = {}) {
  n += 1;
  const id = String(n).padStart(2, '0');
  const file = path.join(OUT, `${id}-${name}.png`);
  await prep(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: file, fullPage: full }).catch(async (e) => {
    log(`  ! fullPage 실패(${name}) → viewport 폴백: ${e.message}`);
    await page.screenshot({ path: file, fullPage: false }).catch(() => null);
  });
  log(`✓ ${id}-${name}.png`);
}

async function safe(label, fn) {
  try {
    await fn();
  } catch (e) {
    log(`✗ SKIP ${label}: ${e.message.split('\n')[0]}`);
  }
}

// dev 로그인 (sign-in 다이얼로그). variant: 'full' | 'associate'
async function devLogin(page, variant) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
  const openBtn = page.locator('[data-testid="dev-sign-in-button"]');
  await openBtn.waitFor({ state: 'visible', timeout: 45000 });
  await openBtn.click({ force: true });
  const itemTestId = variant === 'full' ? 'dev-sign-in-full' : 'dev-sign-in-associate';
  const dialog = page
    .locator('[data-testid="dialog-panel"]')
    .filter({ has: page.locator(`[data-testid="${itemTestId}"]`) })
    .first();
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  if (variant === 'full') {
    const me200 = page.waitForResponse(
      (r) => r.url().includes('/users/me/info') && r.request().method() === 'GET' && r.status() === 200,
      { timeout: 30000 }
    );
    await dialog.locator(`[data-testid="${itemTestId}"]`).click({ force: true });
    await me200;
  } else {
    await dialog.locator(`[data-testid="${itemTestId}"]`).click({ force: true });
  }
}

async function newMobileContext(browser) {
  const ctx = await browser.newContext({ ...iPhone, ignoreHTTPSErrors: true });
  return ctx;
}

(async () => {
  const browser = await chromium.launch();

  // ---------- 워밍 (next dev lazy compile) ----------
  log('워밍 라우트 컴파일...');
  {
    const warm = await newMobileContext(browser);
    const p = await warm.newPage();
    for (const r of ['/sign-in', '/parties', '/docs/terms-of-service']) {
      await p.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    }
    await warm.close();
  }

  let roomUrl = null;

  // ================= 정회원(full crew) =================
  log('=== 정회원(full crew) 세션 ===');
  const member = await newMobileContext(browser);
  const mp = await member.newPage();
  mp.on('console', (m) => m.type() === 'error' && log(`  [console.error] ${m.text().slice(0, 120)}`));

  await safe('member-login', async () => {
    await devLogin(mp, 'full');
  });

  // stale e2e 룸 정리 (1 user 1 host 제약)
  await safe('cleanup-stale-rooms', async () => {
    const res = await member.request.get(new URL('v1/partyrooms', API).toString());
    if (res.ok()) {
      const body = await res.json();
      const list = Array.isArray(body) ? body : body?.data ?? body?.content ?? body?.partyrooms ?? [];
      for (const r of list) {
        const title = r.title || '';
        if (/screenshot|capture|^cap|e2e|MPM|MDJ|MAT|chunk|디자인/i.test(title)) {
          await member.request.delete(new URL(`v1/partyrooms/${r.partyroomId}`, API).toString()).catch(() => null);
        }
      }
    }
  });

  await safe('lobby-member', async () => {
    await mp.goto(`${BASE}/parties`, { waitUntil: 'domcontentloaded' });
    await mp.getByTestId('mobile-create-partyroom-button').waitFor({ timeout: 30000 });
    await shot(mp, 'lobby-member');
  });

  // 언어 변경 메뉴 (헤더) — best effort
  await safe('language-menu', async () => {
    const langBtn = mp.locator('header button, [aria-haspopup]').filter({ has: mp.locator('svg') });
    // PFLanguage 아이콘 버튼: 헤더 우측 버튼들 중 하나. 마지막 후보 시도.
    const candidates = mp.locator('header button');
    const count = await candidates.count();
    if (count > 0) {
      await candidates.nth(count - 1).click({ force: true });
      await mp.waitForTimeout(500);
      await shot(mp, 'language-menu', { full: false });
      await mp.keyboard.press('Escape').catch(() => null);
    }
  });

  // host CTA → 파티 생성 다이얼로그
  await safe('create-dialog', async () => {
    await mp.goto(`${BASE}/parties`, { waitUntil: 'domcontentloaded' });
    await mp.getByTestId('mobile-create-partyroom-button').click();
    await mp.locator('input[name="name"]').waitFor({ timeout: 15000 });
    await shot(mp, 'create-partyroom-dialog', { full: false });
  });

  // 실제 룸 생성 → roomUrl 확보
  await safe('create-room', async () => {
    // ⚠️ Party Name 은 12자 제한 — 초과 시 form invalid → submit 버튼 disabled.
    await mp.locator('input[name="name"]').fill(`cap${Date.now().toString(36).slice(-6)}`);
    await mp.locator('textarea[name="introduce"]').fill('디자인 외주용 캡처 룸');
    // submit 버튼이 활성화될 때까지 대기 (btnDisabled = !isValid).
    const submit = mp.locator('button[type="submit"]').first();
    await submit.waitFor({ state: 'visible', timeout: 10000 });
    // 생성 POST 응답에서 partyroomId 직접 확보 (dev RSC 네비 flake 우회).
    const createResp = mp.waitForResponse(
      (r) => /\/v1\/partyrooms$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST',
      { timeout: 20000 }
    );
    await submit.click();
    const resp = await createResp;
    const body = await resp.json().catch(() => null);
    const id = body?.partyroomId ?? body?.data?.partyroomId;
    if (!id) throw new Error(`partyroomId 파싱 실패: ${JSON.stringify(body)?.slice(0, 120)}`);
    roomUrl = `${BASE}/parties/${id}`;
    log(`룸 생성됨(id=${id}): ${roomUrl}`);
  });

  if (roomUrl) {
    // 룸 진입 + 구독 대기
    await safe('room-enter', async () => {
      await mp.goto(roomUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await mp.getByTestId('mobile-tab-queue').waitFor({ timeout: 60000 });
      await mp.waitForTimeout(3000);
    });

    await safe('room-chat', async () => {
      await mp.getByTestId('mobile-tab-chat').click();
      await mp.waitForTimeout(1000);
      await shot(mp, 'room-chat-tab', { full: false });
    });
    await safe('room-crew', async () => {
      await mp.getByTestId('mobile-tab-crew').click();
      await mp.waitForTimeout(1000);
      await shot(mp, 'room-crew-tab', { full: false });
    });
    await safe('room-queue', async () => {
      await mp.getByTestId('mobile-tab-queue').click();
      await mp.waitForTimeout(1000);
      await shot(mp, 'room-queue-tab', { full: false });
    });

    // 버그 신고 다이얼로그 (헤더에 있으면)
    await safe('bug-report', async () => {
      const bug = mp.getByTestId('bug-report-button');
      if (await bug.isVisible().catch(() => false)) {
        await bug.click();
        await mp.waitForTimeout(800);
        await shot(mp, 'bug-report-dialog', { full: false });
        await mp.keyboard.press('Escape').catch(() => null);
      } else {
        log('  (룸 헤더에 bug-report-button 없음 — 로비에서 시도)');
      }
    });

    // 플레이리스트 관리 시트 (L1)
    await safe('manage-playlists-L1', async () => {
      await mp.getByTestId('mobile-tab-queue').click();
      await mp.getByTestId('member-action-manage-playlists').click();
      await mp.getByTestId('manage-create-cta').waitFor({ timeout: 15000 });
      await shot(mp, 'playlist-manage-L1', { full: false });
    });
    // 생성 폼
    await safe('manage-create', async () => {
      await mp.getByTestId('manage-create-cta').click();
      await mp.getByTestId('manage-create-input').waitFor({ timeout: 10000 });
      await shot(mp, 'playlist-create-form', { full: false });
      // 생성하지 않고 닫기
      const back = mp.getByTestId('fullscreen-sheet-back');
      if (await back.isVisible().catch(() => false)) await back.click().catch(() => null);
    });
    // L2 상세 (기존 카드가 있으면)
    await safe('playlist-detail-L2', async () => {
      const card = mp.locator('[data-testid^="manage-playlist-card-"]').first();
      if (await card.isVisible().catch(() => false)) {
        await card.click();
        await mp.getByTestId('detail-add-tracks').waitFor({ timeout: 15000 });
        await shot(mp, 'playlist-detail-L2', { full: false });
        // L3 곡 추가/검색
        await safe('add-tracks-L3', async () => {
          await mp.getByTestId('detail-add-tracks').click();
          const search = mp.getByTestId('music-search-input');
          await search.waitFor({ timeout: 10000 });
          await shot(mp, 'add-tracks-search-empty-L3', { full: false });
          await search.fill('test song');
          await mp.getByTestId(/^search-item-(add|preview)-/).first().waitFor({ timeout: 15000 }).catch(() => null);
          await mp.waitForTimeout(1200);
          await shot(mp, 'add-tracks-search-results-L3', { full: false });
        });
      } else {
        log('  (기존 플레이리스트 카드 없음 — L2/L3 생략)');
      }
    });
    // 시트 닫기 (해시 리셋)
    await safe('reset-room', async () => {
      await mp.goto(roomUrl, { waitUntil: 'domcontentloaded' });
      await mp.getByTestId('mobile-tab-queue').waitFor({ timeout: 20000 });
      await mp.getByTestId('mobile-tab-queue').click();
    });

    // DJ 등록 → SelectPlaylistSheet → (선택 시) DJ 가이드
    await safe('select-playlist-sheet', async () => {
      await mp.getByTestId('member-action-register').click();
      await mp.locator('[data-testid^="mobile-playlist-card-"]').first().waitFor({ timeout: 15000 });
      await shot(mp, 'dj-register-select-playlist', { full: false });
      const enabled = mp.locator(
        '[data-testid^="mobile-playlist-card-"]:not([data-testid$="-add-tracks"]):not([disabled])'
      ).first();
      if (await enabled.isVisible().catch(() => false)) {
        await enabled.click();
        const confirm = mp.getByTestId('select-playlist-confirm');
        if (await confirm.isEnabled().catch(() => false)) {
          await confirm.click();
          // 첫 디제잉 가이드 모달
          await safe('dj-guide', async () => {
            await mp.getByTestId('guide-start').waitFor({ timeout: 15000 });
            await shot(mp, 'dj-guide-modal', { full: false });
            await mp.getByTestId('guide-start').click();
          });
          // DJ 활성 상태 큐 탭
          await safe('room-dj-active', async () => {
            await mp.waitForTimeout(2000);
            await shot(mp, 'room-queue-dj-active', { full: false });
          });
        }
      }
    });
  }

  // 아바타 설정 (모바일 = desktop-only 폴백 카드)
  await safe('settings-avatar', async () => {
    await mp.goto(`${BASE}/settings/avatar`, { waitUntil: 'domcontentloaded' });
    await mp.waitForTimeout(1500);
    await shot(mp, 'settings-avatar-mobile-fallback');
  });

  // ================= 게스트 =================
  log('=== 게스트 세션 ===');
  const guest = await newMobileContext(browser);
  const gp = await guest.newPage();

  const guestRoutes = [
    ['/', 'home'],
    ['/sign-in', 'sign-in'],
    ['/parties', 'lobby-guest'],
    ['/docs/terms-of-service', 'terms-of-service'],
    ['/docs/privacy-policy', 'privacy-policy'],
    ['/maintenance', 'maintenance'],
    ['/mobile-notice', 'mobile-notice'],
  ];
  for (const [route, name] of guestRoutes) {
    await safe(`guest ${name}`, async () => {
      await gp.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await gp.waitForTimeout(1500);
      await shot(gp, `guest-${name}`);
    });
  }
  // 게스트 룸 뷰
  if (roomUrl) {
    await safe('guest room', async () => {
      await gp.goto(roomUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await gp.waitForTimeout(2500);
      await shot(gp, 'guest-room', { full: false });
    });
  }

  // ================= 신규 준회원(AM) 강제 프로필 온보딩 =================
  log('=== 신규 준회원(AM) 프로필 온보딩 ===');
  const am = await newMobileContext(browser);
  const ap = await am.newPage();
  await safe('AM-onboarding', async () => {
    await devLogin(ap, 'associate');
    await ap.waitForURL(/\/settings\/profile/, { timeout: 30000 });
    await ap.getByTestId('mobile-profile-form').waitFor({ timeout: 30000 });
    await shot(ap, 'profile-onboarding-form-AM');
  });

  // ---------- 룸 정리 ----------
  if (roomUrl) {
    await safe('cleanup-room', async () => {
      const id = roomUrl.match(/\/parties\/(\d+)/)?.[1];
      if (id) await member.request.delete(new URL(`v1/partyrooms/${id}`, API).toString()).catch(() => null);
    });
  }

  await browser.close();
  log(`\n완료. 총 ${n}장 → ${OUT}`);
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});

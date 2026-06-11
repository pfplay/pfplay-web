// 큐에 대기자가 있는 상태의 큐 탭 재캡처 (디자인 외주용 f6 교체 + f7 추가).
// member A: 룸 생성 + DJ 등록(재생 시작) / B·C: 같은 룸에서 큐 등록 후 대기.
// f6 = B 시점(대기 2번째 — 순번 요약 바 + 대기자 목록) / f7 = A 시점(현재 DJ — 요약 바 없음).
// 실행: node scripts/capture-queue-members.mjs (backend :8080 + next dev :3000 선행)
import { chromium, devices } from '@playwright/test';
import path from 'path';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API = process.env.E2E_API_BASE || 'http://localhost:8080/api/';
const OUT = path.join(process.cwd(), 'mobile-screenshots');
const iPhone = devices['iPhone 13'];
const log = (m) => console.log(`[queue-cap] ${m}`);
const HIDE = `.tsqd-parent-container,#__next-build-watcher,nextjs-portal,[data-nextjs-toast],[data-next-badge-root]{display:none!important;}`;

async function shot(page, file) {
  await page.addStyleTag({ content: HIDE }).catch(() => null);
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => null);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, file), fullPage: false });
  log(`✓ ${file}`);
}

async function devLogin(page) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
  const open = page.locator('[data-testid="dev-sign-in-button"]');
  await open.waitFor({ state: 'visible', timeout: 45000 });
  await open.click({ force: true });
  const dialog = page
    .locator('[data-testid="dialog-panel"]')
    .filter({ has: page.locator('[data-testid="dev-sign-in-full"]') })
    .first();
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  const me = page.waitForResponse(
    (r) => r.url().includes('/users/me/info') && r.request().method() === 'GET' && r.status() === 200,
    { timeout: 30000 }
  );
  await dialog.locator('[data-testid="dev-sign-in-full"]').click({ force: true });
  await me;
}

async function enterRoom(page, roomUrl) {
  await page.goto(roomUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByTestId('mobile-tab-queue').waitFor({ timeout: 60000 });
  await page.addStyleTag({ content: HIDE }).catch(() => null);
  await page.waitForTimeout(2500);
}

// 큐 탭 → 플리 관리 → (없으면 생성) → 곡 1개 추가 → 룸 리로드로 시트 초기화
async function ensurePlaylistWithTrack(page, roomUrl, who) {
  await page.getByTestId('mobile-tab-queue').click();
  await page.getByTestId('member-action-manage-playlists').click();
  await page.getByTestId('manage-create-cta').waitFor({ timeout: 15000 });

  let card = page.locator('[data-testid^="manage-playlist-card-"]').first();
  if (!(await card.isVisible().catch(() => false))) {
    log(`${who}: 플리 없음 → 생성`);
    await page.getByTestId('manage-create-cta').click();
    await page.getByTestId('manage-create-input').fill(`cap-${who}`);
    await page.getByTestId('manage-create-submit').click();
    card = page.locator('[data-testid^="manage-playlist-card-"]').first();
  }
  await card.waitFor({ timeout: 10000 });
  await card.click();
  await page.getByTestId('detail-add-tracks').waitFor({ timeout: 15000 });

  // 이미 트랙이 있으면(이전 실행 잔존 멤버) 추가 생략
  const hasTrack = await page
    .locator('[data-testid^="detail-track-remove-"]')
    .first()
    .isVisible()
    .catch(() => false);
  if (!hasTrack) {
    await page.getByTestId('detail-add-tracks').click();
    const search = page.getByTestId('music-search-input');
    await search.waitFor({ timeout: 10000 });
    // 주의: 룸 limit(7분)보다 긴 트랙이면 등록 직후 silent deactivate 로 큐가 비워진다.
    // 'test song' 첫 결과는 7분 이내로 검증됨 (capture-fixes.mjs 와 동일).
    await search.fill('test song');
    await page.getByTestId(/^search-item-add-/).first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(800);
    await page.getByTestId(/^search-item-add-/).first().click();
    await page.waitForTimeout(1500);
  }
  await enterRoom(page, roomUrl); // 시트 상태 초기화
}

async function registerToQueue(page, who) {
  await page.getByTestId('mobile-tab-queue').click();
  await page.getByTestId('member-action-register').click();
  const enabled = page
    .locator('[data-testid^="mobile-playlist-card-"]:not([data-testid$="-add-tracks"]):not([disabled])')
    .first();
  await enabled.waitFor({ timeout: 15000 });
  await enabled.click();
  const confirm = page.getByTestId('select-playlist-confirm');
  await confirm.waitFor({ timeout: 10000 });
  await confirm.click();
  // 첫 등록 가이드는 노출될 때만 dismiss
  await page
    .getByTestId('guide-start')
    .click({ timeout: 8000 })
    .catch(() => null);
  await page.getByTestId('member-action-unregister').waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  log(`${who}: 큐 등록 완료`);
}

(async () => {
  const browser = await chromium.launch();
  const mk = async () => {
    const ctx = await browser.newContext({ ...iPhone, ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    page.on('console', (m) => m.type() === 'error' && log(`  [err] ${m.text().slice(0, 100)}`));
    return { ctx, page };
  };

  const A = await mk();
  await devLogin(A.page);
  log('A 로그인');

  // stale cap 룸 정리
  const res = await A.ctx.request.get(new URL('v1/partyrooms', API).toString());
  if (res.ok()) {
    const body = await res.json();
    const list = Array.isArray(body) ? body : (body?.data ?? body?.content ?? []);
    for (const r of list)
      if (/^cap/i.test(r.title || ''))
        await A.ctx.request
          .delete(new URL(`v1/partyrooms/${r.partyroomId}`, API).toString())
          .catch(() => null);
  }

  const create = await A.ctx.request.post(new URL('v1/partyrooms', API).toString(), {
    data: {
      title: `cap${Date.now().toString(36).slice(-6)}`,
      introduction: '디자인 외주용 캡처 룸',
      playbackTimeLimit: 7,
    },
  });
  if (!create.ok()) throw new Error(`room create HTTP ${create.status()}`);
  const roomId = (await create.json())?.data?.partyroomId;
  const roomUrl = `${BASE}/parties/${roomId}`;
  log(`room ${roomUrl}`);

  await enterRoom(A.page, roomUrl);
  await ensurePlaylistWithTrack(A.page, roomUrl, 'A');
  await registerToQueue(A.page, 'A'); // → 재생 시작, A = 현재 DJ

  const waiters = {};
  for (const who of ['B', 'C']) {
    const M = await mk();
    await devLogin(M.page);
    log(`${who} 로그인`);
    await enterRoom(M.page, roomUrl);
    await ensurePlaylistWithTrack(M.page, roomUrl, who);
    await registerToQueue(M.page, who);
    waiters[who] = M;
  }

  // B·C 모두 등록된 뒤 B 시점 캡처 — 다른 대기자(C)가 목록에 보이는 상태.
  await enterRoom(waiters.B.page, roomUrl);
  await waiters.B.page.getByTestId('mobile-tab-queue').click();
  await waiters.B.page.waitForTimeout(1500);
  await shot(waiters.B.page, 'f6-room-queue-my-position.png'); // B 시점: 대기 2번째/총 3

  await A.page.getByTestId('mobile-tab-queue').click();
  await A.page.waitForTimeout(1500);
  await shot(A.page, 'f7-room-queue-current-dj.png'); // A 시점: 현재 DJ (요약 바 없음)

  await A.ctx.request
    .delete(new URL(`v1/partyrooms/${roomId}`, API).toString())
    .catch(() => null);
  await browser.close();
  log('완료');
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});

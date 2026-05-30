import { type BrowserContext, type Page, expect } from '@playwright/test';
import {
  attachErrorTracing,
  chunk4PartyroomName,
  chunk4PlaylistName,
  cleanupMobileTestPartyrooms,
  createEmptyPlaylist,
  enterMobileRoomAndWaitReady,
  newDesktopUserContext,
} from './chunk4.helpers';
import { test } from '../fixtures/auth.fixtures';
import { closePartyroom, createPartyroom } from '../helpers/partyroom.helpers';

/**
 * chunk 4 — 트랙 추가 플로우 ToS 가드 (mobile project).
 *
 * setup 책임 분리 (display-board.tos.spec.ts §5 / dj-register.spec.ts 와 동일 패턴):
 * - desktop (user1) 가 partyroom setup.
 * - desktop (user2) 가 musicCount=0 인 empty playlist 1개 fresh 생성. SelectPlaylistSheet 의
 *   `[+ 곡 추가]` CTA (`mobile-playlist-card-<id>-add-tracks`) 는 musicCount=0 인 카드에서만
 *   렌더되므로 user2 본인 empty playlist 가 1개 이상 필요.
 * - 본 테스트 (mobile, user2) 가 partyroom join → 큐 탭 → register → SelectPlaylistSheet 의
 *   빈 카드 `[+ 곡 추가]` → AddTracksSheet 검색 → ▶ 미리듣기 → MiniPlayer 노출 → `[+ 추가]` →
 *   MiniPlayer 유지.
 */
test.describe('mobile add-tracks flow', () => {
  let desktopCtx: BrowserContext;
  let user2DesktopCtx: BrowserContext;
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[add-tracks beforeAll][${Date.now() - t0}ms] ${m}`);

    desktopCtx = await newDesktopUserContext(browser, 'a-user1.json');
    const setupPage = await desktopCtx.newPage();
    attachErrorTracing(setupPage, log);

    log('defensive cleanup');
    await cleanupMobileTestPartyrooms(desktopCtx);
    log('cleanup done');

    log('goto /parties');
    await setupPage.goto('/parties');
    log('createPartyroom');
    partyroomUrl = await createPartyroom(
      setupPage,
      chunk4PartyroomName('MAT'),
      'mobile add tracks'
    );
    log(`partyroom created: ${partyroomUrl}`);
    await setupPage.close();

    // user2 의 empty playlist fresh 생성 — 매 run 마다 보장.
    log('setup user2 empty playlist (desktop)');
    user2DesktopCtx = await newDesktopUserContext(browser, 'a-user2.json');
    const user2SetupPage = await user2DesktopCtx.newPage();
    attachErrorTracing(user2SetupPage, log);
    await createEmptyPlaylist(user2SetupPage, chunk4PlaylistName('MATpl'));
    log('user2 empty playlist created');
    await user2SetupPage.close();
    await user2DesktopCtx.close();
  });

  test.afterAll(async () => {
    if (desktopCtx) {
      const cleanupPage = await desktopCtx.newPage();
      await closePartyroom(cleanupPage, partyroomUrl).catch(() => null);
      await cleanupPage.close().catch(() => null);
      await desktopCtx.close().catch(() => null);
    }
  });

  test('모바일 멤버 → 큐 탭 → 빈 플레이리스트의 [+ 곡 추가] → AddTracksSheet → 검색 → ▶ 미리듣기 → [+ 추가] → mini-player 유지', async ({
    user2Context,
  }) => {
    test.setTimeout(90_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[add-tracks test][${Date.now() - t0}ms] ${m}`);
    const page: Page = await user2Context.newPage();
    attachErrorTracing(page, log);

    log('mobile enter');
    await enterMobileRoomAndWaitReady(page, partyroomUrl);
    log('queue tab');
    await page.getByTestId('mobile-tab-queue').click();
    log('register click');
    await page.getByTestId('member-action-register').click();

    // 빈 플레이리스트 카드의 `+ 곡 추가` CTA (musicCount=0 분기) — 본 setup 이 보장.
    const emptyCardCta = page.getByTestId(/^mobile-playlist-card-\d+-add-tracks$/).first();
    await expect(emptyCardCta).toBeVisible({ timeout: 15_000 });
    await emptyCardCta.click();

    log('search');
    const searchInput = page.getByTestId('music-search-input');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill('test song');

    log('preview');
    const firstPreview = page.getByTestId(/^search-item-preview-/).first();
    await expect(firstPreview).toBeVisible({ timeout: 15_000 });
    await firstPreview.click();

    log('expect mini-player');
    await expect(page.getByTestId('mini-player-name')).toBeVisible({ timeout: 10_000 });

    log('add');
    await page.getByTestId('mini-player-add').click();

    // [+ 추가] 후 sheet 유지 + mini-player 여전히 노출.
    await expect(page.getByTestId('mini-player-name')).toBeVisible({ timeout: 5_000 });
    log('done');
  });
});

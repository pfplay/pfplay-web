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
 * - desktop (user2) 가 musicCount=0 인 empty playlist 1개 fresh 생성.
 * - 본 테스트 (mobile, user2) 가 partyroom join → 플레이리스트 액션 → 관리 sheet → 빈 플리
 *   상세 → 곡 추가 → AddTracksSheet 검색 → ▶ 미리듣기 → MiniPlayer 노출 → `[+ 추가]` →
 *   MiniPlayer 유지.
 */
test.describe('mobile add-tracks flow', () => {
  let desktopCtx: BrowserContext;
  let user2DesktopCtx: BrowserContext;
  let partyroomUrl: string;
  let emptyPlaylistName: string;

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
    emptyPlaylistName = chunk4PlaylistName('MATpl');
    await createEmptyPlaylist(user2SetupPage, emptyPlaylistName);
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
    log('open playlist action');
    await page.getByRole('button', { name: /^(Playlist|플레이리스트)$/ }).click();
    const emptyPlaylistCard = page
      .locator('[data-testid^="manage-playlist-card-"]')
      .filter({ hasText: emptyPlaylistName });
    await expect(emptyPlaylistCard).toBeVisible({ timeout: 15_000 });
    await emptyPlaylistCard.click();
    await expect(page.getByTestId('detail-add-tracks')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('detail-add-tracks').click();

    log('search');
    const searchInput = page.getByTestId('music-search-input');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    // #451: 노이즈(list/index) 붙은 URL도 canonical watch?v= 로 정규화되어
    // 해당 영상이 검색된다. videoId 접미 testid 로 "정확히 그 영상" 을 단언.
    log('normalize noisy youtube URL');
    await searchInput.fill('https://youtu.be/dQw4w9WgXcQ?list=LL&index=3');
    await expect(page.getByTestId('search-item-preview-dQw4w9WgXcQ')).toBeVisible({
      timeout: 20_000,
    });
    await searchInput.fill('');

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

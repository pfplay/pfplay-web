import { type BrowserContext, type Page, expect } from '@playwright/test';
import {
  attachErrorTracing,
  chunk4PartyroomName,
  chunk4PlaylistName,
  cleanupMobileTestPartyrooms,
  enterMobileRoomAndWaitReady,
  newDesktopUserContext,
} from './chunk4.helpers';
import { test } from '../fixtures/auth.fixtures';
import {
  closePartyroom,
  createPartyroom,
  createPlaylistWithTracks,
} from '../helpers/partyroom.helpers';

/**
 * chunk 4 — DJ 등록 플로우 ToS 가드 (mobile project).
 *
 * setup 책임 분리 (display-board.tos.spec.ts §5 pattern):
 * - desktop (user1) 가 partyroom 을 setup. createPartyroom helper 의 'Be a pfplay
 *   host' 버튼이 모바일 lobby 에 부재 → 모바일 viewport 에서 setup fail.
 * - desktop (user2) 가 자기 playlist (musicCount>0) 1 개를 fresh 생성. 모바일 SelectPlaylistSheet
 *   카드 선택 → confirm 분기가 동작하려면 user2 본인 playlist 가 최소 1개 필요.
 * - 본 테스트 (mobile, user2) 가 partyroom 에 join → 큐 탭 → register → SelectPlaylistSheet
 *   카드 선택 → confirm → Me 등장 → unregister → confirm → register 버튼 재등장.
 */
test.describe('mobile DJ register flow', () => {
  let desktopCtx: BrowserContext;
  let user2DesktopCtx: BrowserContext;
  let partyroomUrl: string;

  test.beforeAll(async ({ browser }) => {
    // chunk 3.1 Mode C pattern: cold-start 여파 + me-pending guard 바운스 대비.
    test.setTimeout(180_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[dj-register beforeAll][${Date.now() - t0}ms] ${m}`);

    desktopCtx = await newDesktopUserContext(browser, 'a-user1.json');
    const setupPage = await desktopCtx.newPage();
    attachErrorTracing(setupPage, log);

    // backend '1 user 1 host' 제약 회피용 cleanup. user1 host 로 stale 잡혀있으면
    // createPartyroom 이 '이미 다른 파티룸의 호스트입니다' 로 fail.
    log('defensive cleanup');
    await cleanupMobileTestPartyrooms(desktopCtx);
    log('cleanup done');

    log('goto /parties');
    await setupPage.goto('/parties');
    log('createPartyroom');
    partyroomUrl = await createPartyroom(
      setupPage,
      chunk4PartyroomName('MDJ'),
      'mobile dj register'
    );
    log(`partyroom created: ${partyroomUrl}`);
    await setupPage.close();

    // user2 의 playlist (musicCount>0) fresh 생성 — 데스크탑 viewport 에서.
    log('setup user2 playlist (desktop)');
    user2DesktopCtx = await newDesktopUserContext(browser, 'a-user2.json');
    const user2SetupPage = await user2DesktopCtx.newPage();
    attachErrorTracing(user2SetupPage, log);
    await createPlaylistWithTracks(user2SetupPage, chunk4PlaylistName('MDJpl'));
    log('user2 playlist created');
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

  test('모바일 멤버 → 룸 입장 → 큐 탭 → [+ DJ 등록] → SelectPlaylistSheet → 선택 → 큐 리스트에 Me → [큐에서 나가기]', async ({
    user2Context,
  }) => {
    test.setTimeout(90_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[dj-register test][${Date.now() - t0}ms] ${m}`);
    const page: Page = await user2Context.newPage();
    attachErrorTracing(page, log);

    log('mobile enter');
    await enterMobileRoomAndWaitReady(page, partyroomUrl);
    log('queue tab');
    await page.getByTestId('mobile-tab-queue').click();
    log('register click');
    await page.getByTestId('member-action-register').click();

    // SelectPlaylistSheet 의 musicCount>0 카드 (disabled 아님) 선택.
    const enabledCard = page
      .locator(
        '[data-testid^="mobile-playlist-card-"]:not([data-testid$="-add-tracks"]):not([disabled])'
      )
      .first();
    await expect(enabledCard).toBeVisible({ timeout: 15_000 });
    await enabledCard.click();

    const confirmBtn = page.getByTestId('select-playlist-confirm');
    await expect(confirmBtn).toBeEnabled({ timeout: 10_000 });
    await confirmBtn.click();

    log('expect Me row');
    // Me 표기 — QueueListItem 이 `nickname (Me)` 형태로 라벨링.
    await expect(page.getByText(/\(Me\)/).first()).toBeVisible({ timeout: 20_000 });

    log('unregister');
    await page.getByTestId('member-action-unregister').click();
    // 확인 dialog
    await page.getByRole('button', { name: /^(확인|Confirm)$/ }).click();

    await expect(page.getByTestId('member-action-register')).toBeVisible({ timeout: 15_000 });
    log('done');
  });
});

import { type BrowserContext, type Page, expect } from '@playwright/test';
import {
  attachErrorTracing,
  chunk4PartyroomName,
  cleanupMobileTestPartyrooms,
  enterMobileRoomAndWaitReady,
  newDesktopUserContext,
} from './chunk4.helpers';
import { test } from '../fixtures/auth.fixtures';
import { closePartyroom, createPartyroom } from '../helpers/partyroom.helpers';

/**
 * chunk 6 — 모바일 룸 내부 플레이리스트 관리 sheet (mobile project).
 *
 * 4-level sheet stack 의 happy-path CRUD 를 e2e 로 단언:
 *   queue 탭 → "내 플레이리스트 관리"(L1) → 생성 → 카드 → L2 상세 →
 *   곡 추가(L3 AddTracksSheet) → back → 곡 삭제 → back → 플리 삭제.
 *
 * setup 책임 분리 (dj-register / add-tracks 패턴):
 * - desktop(user1) 가 partyroom setup (모바일 lobby host CTA 는 #381 별건 branch).
 * - mobile(user2) 가 join → 큐 탭 → 자기 플레이리스트 관리. 플리/곡 mutation 은
 *   user2 본인 계정 대상이라 룸 상태와 직교. 생성한 플리는 시나리오 끝에서 삭제(self-clean).
 */
test.describe('mobile playlist management (chunk 6)', () => {
  let desktopCtx: BrowserContext;
  let partyroomUrl: string;
  const playlistName = `MPMpl${Date.now().toString(36)}`;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[plmgmt beforeAll][${Date.now() - t0}ms] ${m}`);

    desktopCtx = await newDesktopUserContext(browser, 'a-user1.json');
    const setupPage = await desktopCtx.newPage();
    attachErrorTracing(setupPage, log);

    log('defensive cleanup');
    await cleanupMobileTestPartyrooms(desktopCtx);
    log('goto /parties');
    await setupPage.goto('/parties');
    log('createPartyroom');
    partyroomUrl = await createPartyroom(
      setupPage,
      chunk4PartyroomName('MPM'),
      'mobile playlist management'
    );
    log(`partyroom created: ${partyroomUrl}`);
    await setupPage.close();
  });

  test.afterAll(async () => {
    if (desktopCtx) {
      const cleanupPage = await desktopCtx.newPage();
      await closePartyroom(cleanupPage, partyroomUrl).catch(() => null);
      await cleanupPage.close().catch(() => null);
      await desktopCtx.close().catch(() => null);
    }
  });

  test('큐 탭 → 플리 관리 → 생성 → 곡 추가 → 곡 삭제 → 플리 삭제 (4-level CRUD)', async ({
    user2Context,
  }) => {
    test.setTimeout(120_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[plmgmt test][${Date.now() - t0}ms] ${m}`);
    const page: Page = await user2Context.newPage();
    attachErrorTracing(page, log);

    log('mobile enter');
    await enterMobileRoomAndWaitReady(page, partyroomUrl);
    // dev 전용 React Query Devtools 부유 버튼(.tsqd-parent-container)이 sheet footer 의
    // 클릭 타깃(생성/곡추가 버튼)을 가로채는 dev-only 아티팩트 → 숨김. prod 빌드엔 없음.
    await page
      .addStyleTag({ content: '.tsqd-parent-container{display:none!important;}' })
      .catch(() => null);
    await page.getByTestId('mobile-tab-queue').click();

    // L1 진입
    log('open playlists management (L1)');
    await page.getByTestId('member-action-manage-playlists').click();
    await expect(page.getByTestId('manage-create-cta')).toBeVisible({ timeout: 15_000 });

    // 생성
    log('create playlist');
    await page.getByTestId('manage-create-cta').click();
    await page.getByTestId('manage-create-input').fill(playlistName);
    await page.getByTestId('manage-create-submit').click();

    const card = page
      .locator('[data-testid^="manage-playlist-card-"]')
      .filter({ hasText: playlistName });
    await expect(card).toBeVisible({ timeout: 15_000 });

    // L2 진입 (빈 곡) — locale 독립 단언(testid + 트랙 개수). 갓 생성한 플리라 곡 0.
    log('open detail (L2)');
    await card.click();
    await expect(page.getByTestId('detail-add-tracks')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId(/^detail-track-remove-/)).toHaveCount(0);

    // L3 곡 추가
    log('add track (L3)');
    await page.getByTestId('detail-add-tracks').click();
    const searchInput = page.getByTestId('music-search-input');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill('test song');
    const firstAdd = page.getByTestId(/^search-item-add-/).first();
    await expect(firstAdd).toBeVisible({ timeout: 15_000 });
    await firstAdd.click();

    // L3 → L2 복귀: 곡 카드(삭제 버튼) 노출
    log('back to L2, expect track');
    await page.getByTestId('fullscreen-sheet-back').click();
    const removeBtn = page.getByTestId(/^detail-track-remove-/).first();
    await expect(removeBtn).toBeVisible({ timeout: 15_000 });

    // 곡 삭제 → 다시 빈 상태 (트랙 0)
    log('remove track');
    await removeBtn.click();
    await expect(page.getByTestId(/^detail-track-remove-/)).toHaveCount(0, { timeout: 15_000 });

    // L2 → L1 복귀: 카드 여전히 존재
    log('back to L1');
    await page.getByTestId('fullscreen-sheet-back').click();
    await expect(card).toBeVisible({ timeout: 15_000 });

    // 플리 삭제 (confirm)
    log('delete playlist');
    const li = page.locator('li').filter({ hasText: playlistName });
    await li.getByTestId(/^manage-playlist-delete-/).click();
    await page.getByRole('button', { name: /^(확인|Confirm)$/ }).click();
    await expect(card).toHaveCount(0, { timeout: 15_000 });
    log('done');
  });
});

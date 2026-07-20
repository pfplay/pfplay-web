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
  // #471 호스트(user1) page 를 테스트 내내 열어두기 위한 참조. 셋업이 이 page 를 닫으면
  // 호스트 presence grace(10s) 카운트다운이 시작돼, cold/풀스위트 부하에서 grace 만료 →
  // 방 TERMINATED 로 붕괴하며 user2 의 DJ 등록이 유실된다(dj-queue 빈 채로 단언 실패).
  let hostPage: Page;

  test.beforeAll(async ({ browser }) => {
    // chunk 3.1 Mode C pattern: cold-start 여파 + me-pending guard 바운스 대비.
    test.setTimeout(180_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[dj-register beforeAll][${Date.now() - t0}ms] ${m}`);

    desktopCtx = await newDesktopUserContext(browser, 'a-user1.json');
    hostPage = await desktopCtx.newPage();
    attachErrorTracing(hostPage, log);

    // backend '1 user 1 host' 제약 회피용 cleanup. user1 host 로 stale 잡혀있으면
    // createPartyroom 이 '이미 다른 파티룸의 호스트입니다' 로 fail.
    log('defensive cleanup');
    await cleanupMobileTestPartyrooms(desktopCtx);
    log('cleanup done');

    log('goto /parties');
    await hostPage.goto('/parties');
    log('createPartyroom');
    partyroomUrl = await createPartyroom(
      hostPage,
      chunk4PartyroomName('MDJ'),
      'mobile dj register'
    );
    log(`partyroom created: ${partyroomUrl}`);
    // #471 hostPage.close() 를 하지 않는다 — createPartyroom 이 호스트를 방 안(/parties/{id})까지
    // 진입시키므로, page 를 닫으면 호스트 WS 끊김 → presence PENDING_EXIT → grace 만료 →
    // forceOffline 퇴장 → 방 TERMINATED 로 이어진다. 호스트를 present 로 유지해 방을 테스트
    // 내내 살리고, afterAll 의 desktopCtx.close() 가 이 page 를 정리한다.

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

    // 첫 디제잉 가이드 모달 (showDjingGuide=true 기본값) 이 register 직후 자동 push 됨.
    // 본 spec 의 본질은 register/unregister UI flow 검증이므로, guide 는 dismiss 후 진행.
    log('dismiss djing-guide modal');
    const guideStart = page.getByTestId('guide-start');
    await expect(guideStart).toBeVisible({ timeout: 15_000 });
    await guideStart.click();

    log('expect in-queue signal');
    // user2 가 유일 DJ 면 CurrentDjRow 분기 (no '(Me)' 접미사). queue-list-item 의 `(Me)`
    // 표기는 큐 대기자(orderNumber>0)에만 적용 — unit test 가 별도 커버.
    // e2e 의 본질은 '백엔드 등록 후 UI 가 isMeInQueue=true 로 전이' 확인 → member-action 의
    // unregister 전환을 단언.
    await expect(page.getByTestId('member-action-unregister')).toBeVisible({ timeout: 20_000 });

    log('unregister');
    await page.getByTestId('member-action-unregister').click();
    // 확인 dialog
    await page.getByRole('button', { name: /^(확인|Confirm)$/ }).click();

    await expect(page.getByTestId('member-action-register')).toBeVisible({ timeout: 15_000 });
    log('done');
  });
});

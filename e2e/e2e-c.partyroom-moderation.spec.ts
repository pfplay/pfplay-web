import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixtures';
import {
  blockCrewFromChatMessage,
  closePartyroom,
  confirmAlertDialog,
  confirmPenaltyAlertAndWaitForLobby,
  confirmPenaltyDialog,
  createPartyroom,
  enterPartyroomAndWaitUntilReady,
  getChatNicknameByMessage,
  liftBlockedCrew,
  openAllCrewsPanel,
  openPartyroomChatPanel,
  openRestrictionCategory,
  openRestrictionPanel,
  sendChatMessage,
  waitForChatMessage,
  waitForChatMessageToDisappear,
  clickCrewMenuAction,
  leavePartyroom,
} from './helpers/partyroom.helpers';

/**
 * E2E-C: 채팅 차단 + 제재 복구 + Kick/Ban 재입장 제어
 *
 * 관리자 권한 사용자가 같은 파티룸 안에서 다른 사용자를 block / kick / ban 했을 때,
 * 각 사용자 화면에 반영되는 채팅/모달/재입장 제한 상태가 올바르게 동작해야 한다.
 *
 * 해당 기준: A (Auth→파티룸입장 체인) + B (다중 사용자 실시간 반영) + C (제재/복구 흐름)
 *
 * 흐름:
 *   1. User1: 파티룸 생성
 *   2. User2: 동일 파티룸 입장 후 채팅 전송
 *   3. User1: 채팅 hover 메뉴에서 User2를 block
 *   4. ✅ User1 화면: User2 채팅이 목록에서 사라짐
 *   5. User1: Restriction > Blocked list 에서 User2 lift
 *   6. User1: All crews 에서 User2 kick(reason=test kick)
 *   7. ✅ User2 화면: removed by admin 모달 확인 후 /parties 이동, 재입장 가능
 *   8. User1: 재입장한 User2를 ban(reason=test ban)
 *   9. ✅ User2 화면: permanent removed 모달 확인 후 /parties 이동
 *  10. ✅ User2: 동일 파티룸 재입장 시도 시 "이용이 정지된 사용자입니다" 모달 표시
 *
 * 검증 목표:
 *   - block 시 local blocked list 기반 채팅 필터링이 즉시 반영되는가
 *   - unblock / kick / ban mutation 이후 각 패널과 상대 클라이언트 alert가 동기화되는가
 *   - one-time expulsion 과 permanent expulsion 의 재입장 정책 차이가 정확히 적용되는가
 */
test('관리자는 block 해제 후 kick / ban 제재 흐름을 제어할 수 있다', async ({
  user1Context,
  user2Context,
}) => {
  test.setTimeout(120_000);

  const startedAt = Date.now();
  const log = (message: string) => {
    const elapsed = `${Date.now() - startedAt}ms`.padStart(8, ' ');
    console.log(`[E2E-C][${elapsed}] ${message}`);
  };
  const attachPageDebug = (label: string, page: Page) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        log(`${label} console.${msg.type()}: ${msg.text()}`);
      }
    });
    page.on('pageerror', (error) => {
      log(`${label} pageerror: ${error.message}`);
    });
    page.on('close', () => {
      log(`${label} page closed`);
    });
    page.on('crash', () => {
      log(`${label} page crashed`);
    });
    page.on('response', (response) => {
      const url = response.url();
      if (
        /\/v1\/partyrooms\/\d+\/(setup|crews\/me|penalties)$/.test(url) ||
        /\/v1\/crews\/me\/blocks(?:\/\d+)?$/.test(url)
      ) {
        log(`${label} response ${response.status()} ${response.request().method()} ${url}`);
      }
    });
  };

  const page1 = await user1Context.newPage();
  const page2 = await user2Context.newPage();
  attachPageDebug('user1', page1);
  attachPageDebug('user2', page2);

  let partyroomUrl: string | undefined;
  const uniqueSuffix = Date.now().toString(36);
  const partyroomName = `E2EC${uniqueSuffix}`;
  const chatMessage = `e2e-c-chat-${uniqueSuffix}`;

  try {
    log('user1 goto /parties');
    await page1.goto('/parties');

    log(`user1 creating partyroom: ${partyroomName}`);
    partyroomUrl = await createPartyroom(page1, partyroomName, 'moderation test');
    log(`partyroom created: ${partyroomUrl}`);

    log('waiting for user1 partyroom readiness');
    await enterPartyroomAndWaitUntilReady(page1, partyroomUrl);

    log('user2 entering partyroom');
    await enterPartyroomAndWaitUntilReady(page2, partyroomUrl);

    log(`user2 sending chat: ${chatMessage}`);
    await openPartyroomChatPanel(page2);
    await sendChatMessage(page2, chatMessage);

    log('waiting for chat message on both users');
    await Promise.all([
      waitForChatMessage(page1, chatMessage),
      waitForChatMessage(page2, chatMessage),
    ]);

    const user2Nickname = await getChatNicknameByMessage(page1, chatMessage);
    log(`captured user2 nickname from chat: ${user2Nickname}`);
    expect(user2Nickname).toBeTruthy();

    log('user1 blocking user2 from chat hover menu');
    await openPartyroomChatPanel(page1);
    await blockCrewFromChatMessage(page1, chatMessage);
    await confirmAlertDialog(page1);

    log('waiting for blocked chat to disappear on user1');
    await waitForChatMessageToDisappear(page1, chatMessage);

    log('user1 opening restriction panel and lifting block');
    await openRestrictionPanel(page1);
    await openRestrictionCategory(page1, 'BLOCK');
    await liftBlockedCrew(page1, user2Nickname);
    await expect(
      page1.locator('[data-testid="restriction-list-item"]').filter({ hasText: user2Nickname })
    ).toHaveCount(0, {
      timeout: 15_000,
    });

    log('user1 kicking user2 from all crews panel');
    await openAllCrewsPanel(page1);
    await clickCrewMenuAction(page1, user2Nickname, 'kick');
    await confirmPenaltyDialog(page1, 'test kick');

    log('waiting for user2 kick alert and lobby redirect');
    await confirmPenaltyAlertAndWaitForLobby(page2, 'You have been removed by an admin.');

    log('user2 re-entering partyroom after kick');
    await enterPartyroomAndWaitUntilReady(page2, partyroomUrl);

    log('user1 banning user2 from all crews panel');
    await openAllCrewsPanel(page1);
    await clickCrewMenuAction(page1, user2Nickname, 'ban');
    await confirmPenaltyDialog(page1, 'test ban');

    log('waiting for user2 ban alert and lobby redirect');
    await confirmPenaltyAlertAndWaitForLobby(
      page2,
      'You have been permanently removed by an admin and can’t rejoin.'
    );

    log('user2 attempting to re-enter banned partyroom');
    await page2.goto(partyroomUrl);
    await confirmAlertDialog(page2, '이용이 정지된 사용자입니다');
  } finally {
    log('starting cleanup');
    if (page2 && !page2.isClosed()) {
      log('cleanup: leavePartyroom(page2)');
      await leavePartyroom(page2);
    }
    log(`cleanup: ${partyroomUrl ? 'closePartyroom(page1)' : 'leavePartyroom(page1)'}`);
    await (partyroomUrl ? closePartyroom(page1, partyroomUrl) : leavePartyroom(page1));
    log('cleanup finished');
  }
});

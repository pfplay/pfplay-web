import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixtures';
import {
  closePartyroom,
  createPartyroom,
  createPlaylistWithTracks,
  enterPartyroomAndWaitUntilReady,
  leavePartyroom,
  likeCurrentPlayback,
  openAvatarSettingsFromMyProfile,
  openPartyroomChatPanel,
  registerAsDj,
  saveAvatarSettings,
  selectAvatarBodyByIndex,
  sendChatMessage,
  waitForChatMessage,
  waitForCurrentDjAvatarBody,
  waitForCurrentDjLikeReaction,
} from './helpers/partyroom.helpers';

/**
 * E2E-D: 내 프로필 아바타 변경 + 좋아요 리액션 + 채팅 송신
 *
 * 한 사용자가 파티룸에 입장해 DJ가 된 뒤, My Profile > Avatar settings 에서
 * 아바타를 변경하고, 현재 DJ 아바타 반영 / 좋아요 리액션 / 채팅 송신이 모두
 * 정상 동작해야 한다.
 *
 * 해당 기준: A (Auth→파티룸입장 체인) + D (내 프로필/아바타 변경 UI) + E (리액션/채팅)
 *
 * 흐름:
 *   1. User1: 파티룸 생성
 *   2. User1: 플레이리스트 생성 후 DJ 등록
 *   3. User1: My Profile > Avatar settings 진입
 *   4. User1: 두 번째 avatar body 선택 후 저장
 *   5. ✅ User1 화면: 현재 DJ 아바타가 새 body로 반영됨
 *   6. User1: 좋아요 클릭
 *   7. ✅ User1 화면: 현재 DJ 아바타에 LIKE 리액션이 반영됨
 *   8. User1: 채팅 입력
 *   9. ✅ User1 화면: 해당 채팅이 목록에 표시됨
 *
 * 검증 목표:
 *   - 프로필 아바타 변경 mutation 이후 현재 파티룸 아바타 UI가 동기화되는가
 *   - 현재 playback에 대한 LIKE 리액션이 내 아바타 상태로 반영되는가
 *   - 채팅 전송 mutation 이후 메시지가 UI 목록에 표시되는가
 */
test('User1은 avatar 변경 후 like 리액션과 채팅 송신을 확인할 수 있다', async ({
  user1Context,
}) => {
  test.setTimeout(120_000);

  const startedAt = Date.now();
  const log = (message: string) => {
    const elapsed = `${Date.now() - startedAt}ms`.padStart(8, ' ');
    console.log(`[E2E-D][${elapsed}] ${message}`);
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
        /\/v1\/partyrooms\/\d+\/(setup|dj-queue|playbacks\/reaction|crews\/me)$/.test(url) ||
        /\/v1\/users\/me\/profile\/avatar$/.test(url)
      ) {
        log(`${label} response ${response.status()} ${response.request().method()} ${url}`);
      }
    });
  };

  const page1 = await user1Context.newPage();
  attachPageDebug('user1', page1);
  let partyroomUrl: string | undefined;

  const uniqueSuffix = Date.now().toString(36);
  const playlistName = `E2ED${uniqueSuffix}`;
  const partyroomName = `E2ED${uniqueSuffix}`;
  const chatMessage = `e2e-d-chat-${uniqueSuffix}`;

  try {
    log('user1 goto /parties');
    await page1.goto('/parties');

    // ─── User1: 플레이리스트 생성 + 파티룸 생성 ───────────────────────────
    log(`creating playlist: ${playlistName}`);
    await createPlaylistWithTracks(page1, playlistName);
    log(`playlist created: ${playlistName}`);

    log(`creating partyroom: ${partyroomName}`);
    partyroomUrl = await createPartyroom(page1, partyroomName, 'profile avatar reaction test');
    log(`partyroom created: ${partyroomUrl}`);

    // ─── User1: 파티룸 입장 + DJ 등록 ───────────────────────────────────
    log('waiting for partyroom readiness');
    await enterPartyroomAndWaitUntilReady(page1, partyroomUrl);
    log('registering as DJ');
    await registerAsDj(page1, playlistName);
    log('DJ registration completed');

    const currentDj = page1.locator('[data-testid="partyroom-current-dj"]');
    await expect(currentDj).toBeVisible({ timeout: 20_000 });
    const initialAvatarBodyUri = await currentDj.getAttribute('data-avatar-body-uri');
    log(`captured initial current DJ avatar body: ${initialAvatarBodyUri ?? '<empty>'}`);
    expect(initialAvatarBodyUri).toBeTruthy();

    // ─── User1: My Profile > Avatar settings > 두 번째 body 선택 ───────
    log('opening avatar settings from my profile');
    await openAvatarSettingsFromMyProfile(page1);
    const nextAvatarBodyUri = await selectAvatarBodyByIndex(page1, 1);
    log(`selected second avatar body: ${nextAvatarBodyUri || '<empty>'}`);
    expect(nextAvatarBodyUri).toBeTruthy();

    log('saving avatar settings');
    await saveAvatarSettings(page1);

    // crew_profile_changed broadcast → 현재 DJ 아바타 body 반영
    log('waiting for current DJ avatar body update');
    await waitForCurrentDjAvatarBody(page1, nextAvatarBodyUri);
    log('current DJ avatar body updated');

    // ─── User1: 좋아요 리액션 ───────────────────────────────────────────
    log('clicking like reaction');
    await likeCurrentPlayback(page1);

    log('waiting for current DJ like reaction');
    await waitForCurrentDjLikeReaction(page1);
    log('current DJ like reaction observed');

    // ─── User1: 채팅 전송 ───────────────────────────────────────────────
    log(`sending chat message: ${chatMessage}`);
    await openPartyroomChatPanel(page1);
    await sendChatMessage(page1, chatMessage);

    log('waiting for chat message');
    await waitForChatMessage(page1, chatMessage);
    log('chat message rendered');
  } finally {
    log('starting cleanup');
    log(`cleanup: ${partyroomUrl ? 'closePartyroom(page1)' : 'leavePartyroom(page1)'}`);
    await (partyroomUrl ? closePartyroom(page1, partyroomUrl) : leavePartyroom(page1));
    log('cleanup finished');
  }
});

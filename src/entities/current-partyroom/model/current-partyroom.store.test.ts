import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import type { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import type * as ChatMessage from './chat-message.model';
import type * as Crew from './crew.model';
import { createCurrentPartyroomStore } from './current-partyroom.store';

/* ------------------------------------------------------------------ */
/*  Factory helpers                                                    */
/* ------------------------------------------------------------------ */

const createPartyroomCrew = (overrides: Partial<PartyroomCrew> = {}): PartyroomCrew => ({
  crewId: 1,
  nickname: '테스트유저',
  gradeType: GradeType.CLUBBER,
  avatarBodyUri: 'body.png',
  avatarFaceUri: 'face.png',
  avatarIconUri: 'icon.png',
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  ...overrides,
});

const createCrew = (overrides: Partial<Crew.Model> = {}): Crew.Model => ({
  ...createPartyroomCrew(),
  motionType: MotionType.NONE,
  ...overrides,
});

const createSystemChat = (
  overrides: Partial<ChatMessage.SystemChat> = {}
): ChatMessage.SystemChat => ({
  from: 'system',
  content: '시스템 메시지',
  receivedAt: Date.now(),
  ...overrides,
});

const createUserChat = (overrides: Partial<ChatMessage.UserChat> = {}): ChatMessage.UserChat => ({
  from: 'user',
  crew: createPartyroomCrew(),
  message: '안녕하세요',
  receivedAt: Date.now(),
  ...overrides,
});

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('current-partyroom store', () => {
  test('초기 상태 검증', () => {
    const store = createCurrentPartyroomStore();
    const state = store.getState();

    expect(state.id).toBeUndefined();
    expect(state.exitedOnBackend).toBe(false);
    expect(state.me).toBeUndefined();
    expect(state.playbackActivated).toBe(false);
    expect(state.playback).toBeUndefined();
    expect(state.crews).toEqual([]);
    expect(state.reaction).toEqual({
      history: { isLiked: false, isDisliked: false, isGrabbed: false },
      aggregation: { likeCount: 0, dislikeCount: 0, grabCount: 0 },
      motion: [],
    });
    expect(state.currentDj).toBeUndefined();
    expect(state.notice).toBe('');
    expect(state.chat).toBeDefined();
    expect(state.alert).toBeDefined();
  });

  describe('markExitedOnBackend', () => {
    test('exitedOnBackend가 true로 변경된다', () => {
      const store = createCurrentPartyroomStore();

      store.getState().markExitedOnBackend();

      expect(store.getState().exitedOnBackend).toBe(true);
    });
  });

  describe('updateMe', () => {
    test('me 정보를 부분 업데이트한다', () => {
      const store = createCurrentPartyroomStore();
      const initial = { crewId: 1, gradeType: GradeType.CLUBBER };

      // 먼저 init으로 me를 설정
      store.getState().init({
        id: 1,
        me: initial,
        playbackActivated: false,
        crews: [],
        notice: '',
      });

      store.getState().updateMe({ gradeType: GradeType.MODERATOR });

      expect(store.getState().me).toEqual({
        crewId: 1,
        gradeType: GradeType.MODERATOR,
      });
    });
  });

  describe('updatePlaybackActivated', () => {
    test('playbackActivated 값을 변경한다', () => {
      const store = createCurrentPartyroomStore();

      store.getState().updatePlaybackActivated(true);

      expect(store.getState().playbackActivated).toBe(true);
    });
  });

  describe('updatePlayback', () => {
    test('playback 정보를 업데이트한다', () => {
      const store = createCurrentPartyroomStore();
      const playback = {
        id: 100,
        name: '테스트 곡',
        linkId: 'abc123',
        duration: '03:45',
        thumbnailImage: 'thumb.jpg',
        endTime: 1722750394821,
      };

      store.getState().updatePlayback(() => playback);

      expect(store.getState().playback).toEqual(playback);
    });

    test('playback 정보를 부분 업데이트한다', () => {
      const store = createCurrentPartyroomStore();
      const playback = {
        id: 100,
        name: '테스트 곡',
        linkId: 'abc123',
        duration: '03:45',
        thumbnailImage: 'thumb.jpg',
        endTime: 1722750394821,
      };

      store.getState().updatePlayback(() => playback);
      store.getState().updatePlayback({ name: '변경된 곡' });

      expect(store.getState().playback).toEqual({
        ...playback,
        name: '변경된 곡',
      });
    });
  });

  describe('updateReaction', () => {
    test('reaction aggregation을 업데이트한다', () => {
      const store = createCurrentPartyroomStore();

      store.getState().updateReaction({
        aggregation: { likeCount: 5, dislikeCount: 2, grabCount: 1 },
      });

      const reaction = store.getState().reaction;
      expect(reaction.aggregation).toEqual({
        likeCount: 5,
        dislikeCount: 2,
        grabCount: 1,
      });
      // history는 변경되지 않음
      expect(reaction.history).toEqual({
        isLiked: false,
        isDisliked: false,
        isGrabbed: false,
      });
    });
  });

  describe('updateCrews', () => {
    test('crews 배열을 설정한다', () => {
      const store = createCurrentPartyroomStore();
      const crews = [
        createCrew({ crewId: 1, nickname: '유저1' }),
        createCrew({ crewId: 2, nickname: '유저2' }),
      ];

      store.getState().updateCrews(() => crews);

      expect(store.getState().crews).toHaveLength(2);
      expect(store.getState().crews[0].nickname).toBe('유저1');
      expect(store.getState().crews[1].nickname).toBe('유저2');
    });
  });

  describe('resetCrewsMotion', () => {
    test('모든 크루의 motionType이 NONE으로 초기화된다', () => {
      const store = createCurrentPartyroomStore();
      const crews = [
        createCrew({ crewId: 1, motionType: MotionType.DANCE_TYPE_1 }),
        createCrew({ crewId: 2, motionType: MotionType.DANCE_TYPE_2 }),
      ];

      store.getState().updateCrews(() => crews);
      store.getState().resetCrewsMotion();

      const result = store.getState().crews;
      expect(result[0].motionType).toBe(MotionType.NONE);
      expect(result[1].motionType).toBe(MotionType.NONE);
    });

    test('crews가 비어있으면 빈 배열을 유지한다', () => {
      const store = createCurrentPartyroomStore();

      store.getState().resetCrewsMotion();

      expect(store.getState().crews).toEqual([]);
    });
  });

  describe('updateCurrentDj', () => {
    test('현재 DJ를 설정한다', () => {
      const store = createCurrentPartyroomStore();

      store.getState().updateCurrentDj({ crewId: 42 });

      expect(store.getState().currentDj).toEqual({ crewId: 42 });
    });

    test('현재 DJ를 undefined로 해제한다', () => {
      const store = createCurrentPartyroomStore();
      store.getState().updateCurrentDj({ crewId: 42 });

      store.getState().updateCurrentDj(undefined);

      expect(store.getState().currentDj).toBeUndefined();
    });
  });

  describe('updateNotice', () => {
    test('공지사항 문자열을 설정한다', () => {
      const store = createCurrentPartyroomStore();

      store.getState().updateNotice('새로운 공지사항입니다');

      expect(store.getState().notice).toBe('새로운 공지사항입니다');
    });
  });

  describe('appendChatMessage', () => {
    test('채팅 메시지를 추가한다', () => {
      const store = createCurrentPartyroomStore();
      const message = createSystemChat({ content: '환영합니다' });

      store.getState().appendChatMessage(message);

      const messages = store.getState().chat.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    test('여러 메시지를 순서대로 추가한다', () => {
      const store = createCurrentPartyroomStore();
      const msg1 = createSystemChat({ content: '메시지1', receivedAt: 1000 });
      const msg2 = createUserChat({ message: '메시지2', receivedAt: 2000 });

      store.getState().appendChatMessage(msg1);
      store.getState().appendChatMessage(msg2);

      const messages = store.getState().chat.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual(msg1);
      expect(messages[1]).toEqual(msg2);
    });
  });

  describe('updateChatMessage', () => {
    test('조건에 맞는 메시지를 업데이트한다', () => {
      const store = createCurrentPartyroomStore();
      const msg = createSystemChat({ content: '원본 메시지', receivedAt: 1000 });

      store.getState().appendChatMessage(msg);
      store.getState().updateChatMessage(
        (m) => m.from === 'system' && m.content === '원본 메시지',
        (m) => ({ ...m, content: '수정된 메시지' }) as ChatMessage.Model
      );

      const messages = store.getState().chat.getMessages();
      expect(messages[0]).toEqual(expect.objectContaining({ content: '수정된 메시지' }));
    });
  });

  describe('init', () => {
    test('초기 상태를 리셋하고 전달된 값으로 병합한다', () => {
      const store = createCurrentPartyroomStore();
      // 먼저 상태를 변경
      store.getState().updateNotice('이전 공지');
      store.getState().markExitedOnBackend();

      const crews = [createCrew({ crewId: 10 })];
      store.getState().init({
        id: 99,
        me: { crewId: 10, gradeType: GradeType.HOST },
        playbackActivated: true,
        crews,
        notice: '새 공지',
      });

      const state = store.getState();
      expect(state.id).toBe(99);
      expect(state.me).toEqual({ crewId: 10, gradeType: GradeType.HOST });
      expect(state.playbackActivated).toBe(true);
      expect(state.crews).toEqual(crews);
      expect(state.notice).toBe('새 공지');
      // 초기 상태로 리셋된 값
      expect(state.exitedOnBackend).toBe(false);
    });
  });

  describe('reset', () => {
    test('모든 상태를 초기 상태로 복원한다', () => {
      const store = createCurrentPartyroomStore();
      // 상태를 변경
      store.getState().init({
        id: 99,
        me: { crewId: 10, gradeType: GradeType.HOST },
        playbackActivated: true,
        crews: [createCrew()],
        notice: '공지사항',
      });
      store.getState().markExitedOnBackend();

      store.getState().reset();

      const state = store.getState();
      expect(state.id).toBeUndefined();
      expect(state.exitedOnBackend).toBe(false);
      expect(state.me).toBeUndefined();
      expect(state.playbackActivated).toBe(false);
      expect(state.playback).toBeUndefined();
      expect(state.crews).toEqual([]);
      expect(state.notice).toBe('');
      expect(state.currentDj).toBeUndefined();
    });

    test('reset 후 chat의 메시지가 비워진다', () => {
      const store = createCurrentPartyroomStore();
      store.getState().appendChatMessage(createSystemChat());

      const chatRef = store.getState().chat;
      store.getState().reset();

      // chat.clear()가 호출되어 메시지가 비워짐
      expect(chatRef.getMessages()).toHaveLength(0);
    });
  });
});

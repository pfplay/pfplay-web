vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/analytics', () => ({
  track: vi.fn(),
  identify: vi.fn(),
}));

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { identify, track } from '@/shared/lib/analytics';
import { useStores } from '@/shared/lib/store/stores.context';
import usePlaybackStartCallback from './use-playback-start-callback.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

const createCrew = (overrides: Partial<Crew.Model> = {}): Crew.Model => ({
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
  motionType: MotionType.NONE,
  ...overrides,
});

const createPlaybackEvent = () => ({
  eventType: PartyroomEventType.PLAYBACK_STARTED as const,
  crewId: 10,
  playback: {
    linkId: 'yt-abc123',
    name: '테스트 곡',
    duration: '03:45',
    thumbnailImage: 'thumb.jpg',
  },
});

describe('usePlaybackStartCallback', () => {
  test('playbackActivated=true, playback 업데이트, currentDj 설정', () => {
    const { result } = renderHook(() => usePlaybackStartCallback());
    const callback = result.current;
    const event = createPlaybackEvent();

    callback(event);

    const state = store.getState();
    expect(state.playbackActivated).toBe(true);
    expect(state.currentDj).toEqual({ crewId: 10 });
  });

  test('reaction 리셋 후 aggregation 설정', () => {
    // 기존 reaction history 설정
    store.getState().updateReaction({
      history: { isLiked: true, isDisliked: false, isGrabbed: false },
    });

    const { result } = renderHook(() => usePlaybackStartCallback());
    const callback = result.current;
    const event = createPlaybackEvent();

    callback(event);

    const reaction = store.getState().reaction;
    expect(reaction.aggregation).toEqual({
      likeCount: 0,
      dislikeCount: 0,
      grabCount: 0,
    });
  });

  test('모든 크루 motionType NONE으로 리셋', () => {
    store
      .getState()
      .updateCrews(() => [
        createCrew({ crewId: 1, motionType: MotionType.DANCE_TYPE_1 }),
        createCrew({ crewId: 2, motionType: MotionType.DANCE_TYPE_2 }),
      ]);

    const { result } = renderHook(() => usePlaybackStartCallback());
    const callback = result.current;

    callback(createPlaybackEvent());

    const crews = store.getState().crews;
    expect(crews[0].motionType).toBe(MotionType.NONE);
    expect(crews[1].motionType).toBe(MotionType.NONE);
  });

  describe('analytics emission (regression: lazy state read)', () => {
    test('partyroomId 미설정 상태에서는 분석 이벤트 발화 안 함', () => {
      const { result } = renderHook(() => usePlaybackStartCallback());
      result.current(createPlaybackEvent());
      expect(track).not.toHaveBeenCalled();
      expect(identify).not.toHaveBeenCalled();
    });

    test('hook render 후 store가 갱신돼도 콜백은 최신 partyroomId로 동작 (C1 회귀 방지)', () => {
      // 1) 첫 render — partyroomId 아직 undefined
      const { result } = renderHook(() => usePlaybackStartCallback());
      const callback = result.current;

      // 2) re-render 없이 store만 갱신 (initPartyroom() 흐름 모사)
      store.getState().init({ id: 42, me: { crewId: 99, gradeType: GradeType.CLUBBER } });

      // 3) 동일한 콜백 참조로 이벤트 처리 — getState() 가 최신값을 읽어야 함
      callback(createPlaybackEvent());

      expect(track).toHaveBeenCalledWith('Track Playback Started', {
        partyroom_id: 42,
        track_id: 'yt-abc123',
      });
    });

    test('event.crewId !== my.crewId 일 때는 Track Playback Started만, DJ Turn Started 없음', () => {
      store.getState().init({ id: 42, me: { crewId: 99, gradeType: GradeType.CLUBBER } });

      const { result } = renderHook(() => usePlaybackStartCallback());
      result.current(createPlaybackEvent()); // event.crewId=10, me.crewId=99

      expect(track).toHaveBeenCalledWith('Track Playback Started', expect.any(Object));
      const djTurnCalls = (track as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call) => call[0] === 'DJ Turn Started'
      );
      expect(djTurnCalls).toHaveLength(0);
      expect(identify).not.toHaveBeenCalled();
    });

    test('event.crewId === my.crewId 일 때 DJ Turn Started + total_dj_sessions add+1', () => {
      store.getState().init({ id: 42, me: { crewId: 10, gradeType: GradeType.CLUBBER } });

      const { result } = renderHook(() => usePlaybackStartCallback());
      result.current(createPlaybackEvent()); // event.crewId=10, me.crewId=10

      expect(track).toHaveBeenCalledWith('DJ Turn Started', {
        partyroom_id: 42,
        track_id: 'yt-abc123',
      });
      expect(identify).toHaveBeenCalledWith({ add: { total_dj_sessions: 1 } });
    });
  });
});

vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
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
});

jest.mock('@/shared/lib/store/stores.context');
jest.mock('./utils/use-invalidate-djing-queue.hook');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import usePlaybackStartCallback from './use-playback-start-callback.hook';
import useInvalidateDjingQueue from './utils/use-invalidate-djing-queue.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;
const mockInvalidateDjingQueue = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
  (useInvalidateDjingQueue as jest.Mock).mockReturnValue(mockInvalidateDjingQueue);
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
  eventType: PartyroomEventType.PLAYBACK_START as const,
  crewId: 10,
  playback: {
    linkId: 'yt-abc123',
    name: '테스트 곡',
    duration: '03:45',
    thumbnailImage: 'thumb.jpg',
    likeCount: 5,
    dislikeCount: 1,
    grabCount: 2,
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
      likeCount: 5,
      dislikeCount: 1,
      grabCount: 2,
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

  test('invalidateDjingQueue 호출됨', () => {
    const { result } = renderHook(() => usePlaybackStartCallback());
    const callback = result.current;

    callback(createPlaybackEvent());

    expect(mockInvalidateDjingQueue).toHaveBeenCalledTimes(1);
  });
});

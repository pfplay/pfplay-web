jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType, ReactionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useReactionMotionCallback from './use-reaction-motion-callback.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
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

describe('useReactionMotionCallback', () => {
  test('해당 crewId의 motionType, reactionType을 업데이트한다', () => {
    store.getState().updateCrews(() => [createCrew({ crewId: 1 }), createCrew({ crewId: 2 })]);

    const { result } = renderHook(() => useReactionMotionCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.REACTION_PERFORMED,
      motionType: MotionType.DANCE_TYPE_1,
      reactionType: ReactionType.LIKE,
      crew: { crewId: 1 },
    });

    const crews = store.getState().crews;
    expect(crews[0].motionType).toBe(MotionType.DANCE_TYPE_1);
    expect(crews[0].reactionType).toBe(ReactionType.LIKE);
  });

  test('다른 크루는 변경되지 않는다', () => {
    store
      .getState()
      .updateCrews(() => [
        createCrew({ crewId: 1 }),
        createCrew({ crewId: 2, nickname: '다른유저' }),
      ]);

    const { result } = renderHook(() => useReactionMotionCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.REACTION_PERFORMED,
      motionType: MotionType.DANCE_TYPE_2,
      reactionType: ReactionType.DISLIKE,
      crew: { crewId: 1 },
    });

    const crews = store.getState().crews;
    expect(crews[1].motionType).toBe(MotionType.NONE);
    expect(crews[1].reactionType).toBeUndefined();
  });
});

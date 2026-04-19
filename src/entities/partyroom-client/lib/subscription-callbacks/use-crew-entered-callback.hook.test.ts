vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { AvatarCompositionType, GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useCrewEnteredCallback from './use-crew-entered-callback.hook';

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
  avatarCompositionType: AvatarCompositionType.COMBINED,
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
  ...overrides,
});

const createCrewEnteredEvent = (crewId = 1) => ({
  eventType: PartyroomEventType.CREW_ENTERED as const,
  partyroomId: 1,
  id: 'event-id',
  timestamp: Date.now(),
  crew: {
    crewId,
    nickname: '입장유저',
    gradeType: GradeType.CLUBBER,
    avatar: {
      avatarCompositionType: AvatarCompositionType.COMBINED,
      avatarBodyUri: 'entered-body.png',
      avatarFaceUri: null,
      avatarIconUri: 'entered-icon.png',
      combinePositionX: 10,
      combinePositionY: 20,
      offsetX: 3,
      offsetY: 4,
      scale: 1.2,
    },
  },
});

describe('useCrewEnteredCallback', () => {
  test('새로 입장한 크루를 추가한다', () => {
    const { result } = renderHook(() => useCrewEnteredCallback());

    result.current(createCrewEnteredEvent(1));

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0]).toMatchObject({
      crewId: 1,
      nickname: '입장유저',
      avatarFaceUri: '',
      motionType: MotionType.NONE,
    });
  });

  test('이미 존재하는 crewId의 입장 이벤트는 중복 추가하지 않고 갱신한다', () => {
    store.getState().updateCrews(() => [
      createCrew({
        crewId: 1,
        nickname: '기존유저',
        motionType: MotionType.DANCE_TYPE_1,
      }),
    ]);
    const { result } = renderHook(() => useCrewEnteredCallback());

    result.current(createCrewEnteredEvent(1));

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0]).toMatchObject({
      crewId: 1,
      nickname: '입장유저',
      avatarBodyUri: 'entered-body.png',
      avatarFaceUri: '',
      motionType: MotionType.DANCE_TYPE_1,
    });
  });
});

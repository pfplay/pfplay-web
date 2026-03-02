jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { AccessType, GradeType, MotionType } from '@/shared/api/http/types/@enums';
import type { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import usePartyroomAccessCallback from './use-partyroom-access-callback.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
});

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

describe('usePartyroomAccessCallback', () => {
  test('ENTER → crews 배열에 새 크루 추가 (motionType=NONE 포함)', () => {
    const { result } = renderHook(() => usePartyroomAccessCallback());
    const callback = result.current;

    const newCrew = createPartyroomCrew({ crewId: 10, nickname: '새유저' });

    callback({
      eventType: PartyroomEventType.PARTYROOM_ACCESS,
      accessType: AccessType.ENTER,
      crew: newCrew,
    });

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0]).toEqual({ ...newCrew, motionType: MotionType.NONE });
  });

  test('EXIT → crews 배열에서 해당 crewId 제거', () => {
    const existing = [
      createCrew({ crewId: 1, nickname: '유저1' }),
      createCrew({ crewId: 2, nickname: '유저2' }),
    ];
    store.getState().updateCrews(() => existing);

    const { result } = renderHook(() => usePartyroomAccessCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.PARTYROOM_ACCESS,
      accessType: AccessType.EXIT,
      crew: { crewId: 1 },
    });

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0].crewId).toBe(2);
  });

  test('EXIT → 존재하지 않는 crewId → 배열 변동 없음', () => {
    const existing = [createCrew({ crewId: 1 })];
    store.getState().updateCrews(() => existing);

    const { result } = renderHook(() => usePartyroomAccessCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.PARTYROOM_ACCESS,
      accessType: AccessType.EXIT,
      crew: { crewId: 999 },
    });

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0].crewId).toBe(1);
  });
});

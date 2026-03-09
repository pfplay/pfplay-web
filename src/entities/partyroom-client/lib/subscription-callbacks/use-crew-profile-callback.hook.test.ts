jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useCrewProfileCallback from './use-crew-profile-callback.hook';

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

describe('useCrewProfileCallback', () => {
  test('해당 crewId의 프로필 필드를 업데이트한다 (eventType 제외)', () => {
    store.getState().updateCrews(() => [createCrew({ crewId: 1, nickname: '원래이름' })]);

    const { result } = renderHook(() => useCrewProfileCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CREW_PROFILE_CHANGED,
      crewId: 1,
      nickname: '새이름',
      avatar: {
        avatarCompositionType: 'COMBINED' as any,
        avatarBodyUri: 'new-body.png',
        avatarFaceUri: 'new-face.png',
        avatarIconUri: 'new-icon.png',
        combinePositionX: 10,
        combinePositionY: 20,
        offsetX: 5,
        offsetY: 5,
        scale: 2,
      },
    });

    const crew = store.getState().crews[0];
    expect(crew.nickname).toBe('새이름');
    expect(crew.avatarBodyUri).toBe('new-body.png');
    expect(crew.avatarFaceUri).toBe('new-face.png');
    expect(crew.avatarIconUri).toBe('new-icon.png');
    expect(crew.combinePositionX).toBe(10);
    expect(crew.combinePositionY).toBe(20);
    expect(crew.offsetX).toBe(5);
    expect(crew.offsetY).toBe(5);
    expect(crew.scale).toBe(2);
    // motionType은 기존 값 유지
    expect(crew.motionType).toBe(MotionType.NONE);
  });

  test('다른 크루는 변경되지 않는다', () => {
    store
      .getState()
      .updateCrews(() => [
        createCrew({ crewId: 1, nickname: '유저1' }),
        createCrew({ crewId: 2, nickname: '유저2' }),
      ]);

    const { result } = renderHook(() => useCrewProfileCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CREW_PROFILE_CHANGED,
      crewId: 1,
      nickname: '변경된이름',
      avatar: {
        avatarCompositionType: 'COMBINED' as any,
        avatarBodyUri: 'body.png',
        avatarFaceUri: 'face.png',
        avatarIconUri: 'icon.png',
        combinePositionX: 0,
        combinePositionY: 0,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      },
    });

    const crews = store.getState().crews;
    expect(crews[0].nickname).toBe('변경된이름');
    expect(crews[1].nickname).toBe('유저2');
  });
});

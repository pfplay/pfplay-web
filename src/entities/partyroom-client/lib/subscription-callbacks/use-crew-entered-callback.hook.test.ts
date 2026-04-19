vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { AvatarCompositionType, GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import type { CrewEnteredEvent } from '@/shared/api/websocket/types/partyroom';
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
  avatarCompositionType: AvatarCompositionType.NONE,
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
  ...overrides,
});

const createCrewEnteredEvent = (
  crewId: number,
  nickname = '새유저',
  countryCode?: string | null
): CrewEnteredEvent => ({
  partyroomId: 1,
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  eventType: PartyroomEventType.CREW_ENTERED,
  crew: {
    crewId,
    gradeType: GradeType.CLUBBER,
    nickname,
    avatar: {
      avatarCompositionType: AvatarCompositionType.NONE,
      avatarBodyUri: 'body.png',
      avatarFaceUri: null,
      avatarIconUri: 'icon.png',
      combinePositionX: 0,
      combinePositionY: 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
    countryCode,
  },
});

describe('useCrewEnteredCallback', () => {
  test('새로운 크루가 입장하면 crews에 추가된다', () => {
    store.getState().updateCrews(() => [createCrew({ crewId: 1, nickname: '기존유저' })]);

    const { result } = renderHook(() => useCrewEnteredCallback());
    const callback = result.current;

    callback(createCrewEnteredEvent(2, '새유저'));

    const crews = store.getState().crews;
    expect(crews).toHaveLength(2);
    expect(crews[1].crewId).toBe(2);
    expect(crews[1].nickname).toBe('새유저');
  });

  test('입장한 크루의 motionType은 NONE으로 초기화된다', () => {
    const { result } = renderHook(() => useCrewEnteredCallback());
    const callback = result.current;

    callback(createCrewEnteredEvent(1));

    const crews = store.getState().crews;
    expect(crews[0].motionType).toBe(MotionType.NONE);
  });

  test('이미 존재하는 crewId로 입장 이벤트가 오면 중복 추가하지 않는다', () => {
    store.getState().updateCrews(() => [createCrew({ crewId: 1, nickname: '기존유저' })]);

    const { result } = renderHook(() => useCrewEnteredCallback());
    const callback = result.current;

    callback(createCrewEnteredEvent(1, '중복유저'));

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0].nickname).toBe('기존유저');
  });

  test('동일 crewId로 연속 입장 이벤트가 와도 1명만 유지된다', () => {
    const { result } = renderHook(() => useCrewEnteredCallback());
    const callback = result.current;

    callback(createCrewEnteredEvent(5, '유저A'));
    callback(createCrewEnteredEvent(5, '유저A'));
    callback(createCrewEnteredEvent(5, '유저A'));

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0].crewId).toBe(5);
  });

  test('아바타 중첩 구조가 플랫 구조로 변환된다', () => {
    const { result } = renderHook(() => useCrewEnteredCallback());
    const callback = result.current;

    callback(createCrewEnteredEvent(1));

    const crew = store.getState().crews[0];
    expect(crew).toHaveProperty('avatarBodyUri');
    expect(crew).toHaveProperty('avatarFaceUri');
    expect(crew).toHaveProperty('combinePositionX');
    expect(crew).toHaveProperty('offsetX');
    expect(crew).toHaveProperty('scale');
    // avatarFaceUri가 null이면 빈 문자열로 변환
    expect(crew.avatarFaceUri).toBe('');
  });

  test('입장한 크루의 countryCode가 매핑된다', () => {
    const { result } = renderHook(() => useCrewEnteredCallback());
    const callback = result.current;

    callback(createCrewEnteredEvent(1, '한국유저', 'KR'));

    const crew = store.getState().crews[0];
    expect(crew.countryCode).toBe('KR');
  });

  test('countryCode가 없는 크루는 countryCode가 undefined이다', () => {
    const { result } = renderHook(() => useCrewEnteredCallback());
    const callback = result.current;

    callback(createCrewEnteredEvent(1));

    const crew = store.getState().crews[0];
    expect(crew.countryCode).toBeUndefined();
  });
});

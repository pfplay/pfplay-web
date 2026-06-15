vi.mock('@/shared/lib/store/stores.context');

import { act, renderHook } from '@testing-library/react';
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

afterEach(() => {
  vi.restoreAllMocks();
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

const createCrewEnteredEvent = (crewId: number, nickname = '새유저'): CrewEnteredEvent => ({
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
  },
});

describe('useCrewEnteredCallback', () => {
  test('새로 입장한 크루를 추가한다', () => {
    const { result } = renderHook(() => useCrewEnteredCallback());

    act(() => {
      result.current(createCrewEnteredEvent(1));
    });

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0]).toMatchObject({
      crewId: 1,
      nickname: '새유저',
      avatarFaceUri: '',
      motionType: MotionType.NONE,
    });
  });

  test('새로 입장한 크루는 presence system chat을 추가한다', () => {
    vi.spyOn(Date, 'now').mockReturnValue(777);
    const { result } = renderHook(() => useCrewEnteredCallback());

    act(() => {
      result.current(createCrewEnteredEvent(9, '새유저'));
    });

    const messages = store.getState().chat.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual({
      from: 'system',
      variant: 'presence',
      i18nKey: 'chat.para.crew_entered',
      values: { nickname: '새유저' },
      receivedAt: 777,
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

    act(() => {
      result.current(createCrewEnteredEvent(1));
    });

    const crews = store.getState().crews;
    expect(crews).toHaveLength(1);
    expect(crews[0]).toMatchObject({
      crewId: 1,
      nickname: '새유저',
      avatarBodyUri: 'body.png',
      avatarFaceUri: '',
      motionType: MotionType.DANCE_TYPE_1,
    });
  });

  test('이미 존재하는 crewId의 입장 이벤트는 presence system chat을 추가하지 않는다', () => {
    store.getState().updateCrews(() => [createCrew({ crewId: 1, nickname: '기존유저' })]);
    const { result } = renderHook(() => useCrewEnteredCallback());

    act(() => {
      result.current(createCrewEnteredEvent(1, '갱신유저'));
    });

    expect(store.getState().chat.getMessages()).toHaveLength(0);
  });
});

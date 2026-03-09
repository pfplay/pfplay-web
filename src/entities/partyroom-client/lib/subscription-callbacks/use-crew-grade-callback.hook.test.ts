jest.mock('@/shared/lib/store/stores.context');
jest.mock('@/shared/lib/functions/log/logger', () => ({
  errorLog: jest.fn(),
}));
jest.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  default: () => (logFn: Function) => logFn,
}));

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { errorLog } from '@/shared/lib/functions/log/logger';
import { useStores } from '@/shared/lib/store/stores.context';
import useCrewGradeCallback from './use-crew-grade-callback.hook';

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

describe('useCrewGradeCallback', () => {
  test('대상 크루의 gradeType을 업데이트한다', () => {
    store
      .getState()
      .updateCrews(() => [
        createCrew({ crewId: 1, nickname: '관리자', gradeType: GradeType.HOST }),
        createCrew({ crewId: 2, nickname: '대상유저', gradeType: GradeType.CLUBBER }),
      ]);

    const { result } = renderHook(() => useCrewGradeCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CREW_GRADE_CHANGED,
      adjuster: { crewId: 1 },
      adjusted: {
        crewId: 2,
        prevGradeType: GradeType.CLUBBER,
        currGradeType: GradeType.MODERATOR,
      },
    });

    const crews = store.getState().crews;
    expect(crews[1].gradeType).toBe(GradeType.MODERATOR);
    // adjuster의 등급은 변경되지 않음
    expect(crews[0].gradeType).toBe(GradeType.HOST);
  });

  test('등급 변경 시스템 채팅 메시지를 append한다', () => {
    store
      .getState()
      .updateCrews(() => [
        createCrew({ crewId: 1, nickname: '관리자' }),
        createCrew({ crewId: 2, nickname: '대상유저' }),
      ]);

    const { result } = renderHook(() => useCrewGradeCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CREW_GRADE_CHANGED,
      adjuster: { crewId: 1 },
      adjusted: {
        crewId: 2,
        prevGradeType: GradeType.CLUBBER,
        currGradeType: GradeType.MODERATOR,
      },
    });

    const messages = store.getState().chat.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].from).toBe('system');
    if (messages[0].from === 'system') {
      expect(messages[0].content).toContain('관리자');
      expect(messages[0].content).toContain('대상유저');
      expect(messages[0].content).toContain('Mod');
    }
  });

  test('조정 대상이 본인이면 me.gradeType도 업데이트 + alert.notify 호출', () => {
    store.getState().init({
      id: 1,
      me: { crewId: 2, gradeType: GradeType.CLUBBER },
      playbackActivated: false,
      crews: [
        createCrew({ crewId: 1, nickname: '관리자' }),
        createCrew({ crewId: 2, nickname: '본인' }),
      ],
      notice: '',
    });

    const alertNotify = jest.spyOn(store.getState().alert, 'notify');

    const { result } = renderHook(() => useCrewGradeCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CREW_GRADE_CHANGED,
      adjuster: { crewId: 1 },
      adjusted: {
        crewId: 2,
        prevGradeType: GradeType.CLUBBER,
        currGradeType: GradeType.MODERATOR,
      },
    });

    expect(store.getState().me?.gradeType).toBe(GradeType.MODERATOR);
    expect(alertNotify).toHaveBeenCalledWith({
      type: 'grade-adjusted',
      prev: GradeType.CLUBBER,
      next: GradeType.MODERATOR,
    });
  });

  test('조정 대상이 본인이 아니면 me 업데이트/alert 호출 안 함', () => {
    store.getState().init({
      id: 1,
      me: { crewId: 3, gradeType: GradeType.CLUBBER },
      playbackActivated: false,
      crews: [
        createCrew({ crewId: 1, nickname: '관리자' }),
        createCrew({ crewId: 2, nickname: '대상유저' }),
        createCrew({ crewId: 3, nickname: '본인' }),
      ],
      notice: '',
    });

    const alertNotify = jest.spyOn(store.getState().alert, 'notify');

    const { result } = renderHook(() => useCrewGradeCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CREW_GRADE_CHANGED,
      adjuster: { crewId: 1 },
      adjusted: {
        crewId: 2,
        prevGradeType: GradeType.CLUBBER,
        currGradeType: GradeType.MODERATOR,
      },
    });

    expect(store.getState().me?.gradeType).toBe(GradeType.CLUBBER);
    expect(alertNotify).not.toHaveBeenCalled();
  });

  test('adjuster/adjusted를 찾지 못하면 에러 로그 + 아무 동작 안 함', () => {
    store.getState().updateCrews(() => [createCrew({ crewId: 1 })]);

    const { result } = renderHook(() => useCrewGradeCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CREW_GRADE_CHANGED,
      adjuster: { crewId: 999 },
      adjusted: {
        crewId: 888,
        prevGradeType: GradeType.CLUBBER,
        currGradeType: GradeType.MODERATOR,
      },
    });

    expect(errorLog).toHaveBeenCalledWith('Adjuster or Adjusted not found');
    expect(store.getState().chat.getMessages()).toHaveLength(0);
  });
});

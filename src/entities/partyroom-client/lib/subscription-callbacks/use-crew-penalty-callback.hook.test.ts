vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/functions/log/logger', () => ({
  errorLog: vi.fn(),
}));
vi.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  default: () => (logFn: Function) => logFn,
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    chat: { para: { remove_chat: '{subject}님이 {target}님의 채팅을 삭제했습니다.' } },
  }),
}));
vi.mock('@/shared/lib/localization/renderer/processors/variable-processor-util', () => ({
  processI18nString: (template: string, vars: Record<string, string>) =>
    template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? ''),
}));

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType, PenaltyType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { errorLog } from '@/shared/lib/functions/log/logger';
import { useStores } from '@/shared/lib/store/stores.context';
import useCrewPenaltyCallback from './use-crew-penalty-callback.hook';

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

describe('useCrewPenaltyCallback', () => {
  describe('CHAT_MESSAGE_REMOVAL', () => {
    test('해당 messageId의 채팅을 시스템 메시지로 교체한다', () => {
      const punisher = createCrew({ crewId: 1, nickname: '관리자' });
      const punished = createCrew({ crewId: 2, nickname: '위반자' });
      store.getState().updateCrews(() => [punisher, punished]);

      // user 채팅 메시지 추가
      store.getState().appendChatMessage({
        from: 'user',
        crew: punished,
        message: { messageId: 'target-msg', content: '위반 메시지' },
        receivedAt: 1000,
      });

      const { result } = renderHook(() => useCrewPenaltyCallback());
      const callback = result.current;

      callback({
        eventType: PartyroomEventType.CREW_PENALIZED,
        penaltyType: PenaltyType.CHAT_MESSAGE_REMOVAL,
        detail: 'target-msg',
        punisher: { crewId: 1 },
        punished: { crewId: 2 },
      });

      const messages = store.getState().chat.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].from).toBe('system');
      if (messages[0].from === 'system') {
        expect(messages[0].content).toContain('관리자');
        expect(messages[0].content).toContain('위반자');
      }
    });

    test('punisher/punished 못 찾으면 에러 로그 + 아무 동작 안 함', () => {
      store.getState().updateCrews(() => [createCrew({ crewId: 1 })]);

      store.getState().appendChatMessage({
        from: 'user',
        crew: createCrew({ crewId: 99 }),
        message: { messageId: 'some-msg', content: '내용' },
        receivedAt: 1000,
      });

      const { result } = renderHook(() => useCrewPenaltyCallback());
      const callback = result.current;

      callback({
        eventType: PartyroomEventType.CREW_PENALIZED,
        penaltyType: PenaltyType.CHAT_MESSAGE_REMOVAL,
        detail: 'some-msg',
        punisher: { crewId: 999 },
        punished: { crewId: 888 },
      });

      expect(errorLog).toHaveBeenCalledWith('Punisher or Punished not found');
    });
  });

  describe('기타 패널티', () => {
    test('본인이 대상 → alert.notify 호출', () => {
      store.getState().init({
        id: 1,
        me: { crewId: 2, gradeType: GradeType.CLUBBER },
        playbackActivated: false,
        crews: [createCrew({ crewId: 1 }), createCrew({ crewId: 2 })],
        notice: '',
      });

      const alertNotify = vi.spyOn(store.getState().alert, 'notify');

      const { result } = renderHook(() => useCrewPenaltyCallback());
      const callback = result.current;

      callback({
        eventType: PartyroomEventType.CREW_PENALIZED,
        penaltyType: PenaltyType.CHAT_BAN_30_SECONDS,
        detail: '도배 행위',
        punisher: { crewId: 1 },
        punished: { crewId: 2 },
      });

      expect(alertNotify).toHaveBeenCalledWith({
        type: PenaltyType.CHAT_BAN_30_SECONDS,
        reason: '도배 행위',
      });
    });

    test('본인이 아님 → alert 호출 안 함', () => {
      store.getState().init({
        id: 1,
        me: { crewId: 3, gradeType: GradeType.CLUBBER },
        playbackActivated: false,
        crews: [createCrew({ crewId: 1 }), createCrew({ crewId: 2 }), createCrew({ crewId: 3 })],
        notice: '',
      });

      const alertNotify = vi.spyOn(store.getState().alert, 'notify');

      const { result } = renderHook(() => useCrewPenaltyCallback());
      const callback = result.current;

      callback({
        eventType: PartyroomEventType.CREW_PENALIZED,
        penaltyType: PenaltyType.ONE_TIME_EXPULSION,
        detail: '부적절한 행위',
        punisher: { crewId: 1 },
        punished: { crewId: 2 },
      });

      expect(alertNotify).not.toHaveBeenCalled();
    });
  });
});

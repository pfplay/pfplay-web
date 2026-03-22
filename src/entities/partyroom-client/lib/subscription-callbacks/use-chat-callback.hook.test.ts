vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/functions/log/logger', () => ({
  warnLog: vi.fn(),
}));
vi.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  default: () => (logFn: Function) => logFn,
}));

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { warnLog } from '@/shared/lib/functions/log/logger';
import { useStores } from '@/shared/lib/store/stores.context';
import useChatCallback from './use-chat-callback.hook';

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

describe('useChatCallback', () => {
  test('크루를 찾아서 user 채팅 메시지를 append한다', () => {
    const crew = createCrew({ crewId: 5, nickname: '채팅유저' });
    store.getState().updateCrews(() => [crew]);

    const { result } = renderHook(() => useChatCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CHAT_MESSAGE_SENT,
      crew: { crewId: 5 },
      message: { messageId: 'msg-1', content: '안녕하세요' },
    });

    const messages = store.getState().chat.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].from).toBe('user');
    if (messages[0].from === 'user') {
      expect(messages[0].crew).toEqual(crew);
      expect(messages[0].message).toEqual({ messageId: 'msg-1', content: '안녕하세요' });
    }
  });

  test('크루를 찾지 못하면 warn 로그 + 메시지 append하지 않음', () => {
    store.getState().updateCrews(() => [createCrew({ crewId: 1 })]);

    const { result } = renderHook(() => useChatCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.CHAT_MESSAGE_SENT,
      crew: { crewId: 999 },
      message: { messageId: 'msg-2', content: '메시지' },
    });

    expect(warnLog).toHaveBeenCalled();
    expect(store.getState().chat.getMessages()).toHaveLength(0);
  });
});

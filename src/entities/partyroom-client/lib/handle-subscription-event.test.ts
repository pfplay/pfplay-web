vi.mock('@/shared/lib/functions/log/logger', () => ({
  specificLog: vi.fn(),
  warnLog: vi.fn(),
}));

vi.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  default: () => (fn: any) => fn,
}));

vi.mock('./subscription-callbacks/use-chat-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-crew-grade-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-crew-penalty-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-crew-profile-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-crew-entered-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-crew-exited-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-partyroom-close-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-playback-deactivated-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-partyroom-notice-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-playback-start-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-reaction-aggregation-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-reaction-motion-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('./subscription-callbacks/use-dj-queue-changed-callback.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));

import { renderHook } from '@testing-library/react';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { warnLog } from '@/shared/lib/functions/log/logger';
import useHandleSubscriptionEvent from './handle-subscription-event';
import useChatCallback from './subscription-callbacks/use-chat-callback.hook';
import useCrewEnteredCallback from './subscription-callbacks/use-crew-entered-callback.hook';
import useCrewExitedCallback from './subscription-callbacks/use-crew-exited-callback.hook';
import useCrewGradeCallback from './subscription-callbacks/use-crew-grade-callback.hook';
import useCrewPenaltyCallback from './subscription-callbacks/use-crew-penalty-callback.hook';
import useCrewProfileCallback from './subscription-callbacks/use-crew-profile-callback.hook';
import useDjQueueChangedCallback from './subscription-callbacks/use-dj-queue-changed-callback.hook';
import usePartyroomCloseCallback from './subscription-callbacks/use-partyroom-close-callback.hook';
import usePartyroomNoticeCallback from './subscription-callbacks/use-partyroom-notice-callback.hook';
import usePlaybackDeactivatedCallback from './subscription-callbacks/use-playback-deactivated-callback.hook';
import usePlaybackStartCallback from './subscription-callbacks/use-playback-start-callback.hook';
import useReactionAggregationCallback from './subscription-callbacks/use-reaction-aggregation-callback.hook';
import useReactionMotionCallback from './subscription-callbacks/use-reaction-motion-callback.hook';

type EventTypeToHook = {
  eventType: PartyroomEventType;
  hook: Mock;
  label: string;
};

const CALLBACK_MAP: EventTypeToHook[] = [
  {
    eventType: PartyroomEventType.PARTYROOM_CLOSED,
    hook: usePartyroomCloseCallback as Mock,
    label: 'usePartyroomCloseCallback',
  },
  {
    eventType: PartyroomEventType.PLAYBACK_DEACTIVATED,
    hook: usePlaybackDeactivatedCallback as Mock,
    label: 'usePlaybackDeactivatedCallback',
  },
  {
    eventType: PartyroomEventType.CREW_ENTERED,
    hook: useCrewEnteredCallback as Mock,
    label: 'useCrewEnteredCallback',
  },
  {
    eventType: PartyroomEventType.CREW_EXITED,
    hook: useCrewExitedCallback as Mock,
    label: 'useCrewExitedCallback',
  },
  {
    eventType: PartyroomEventType.PARTYROOM_NOTICE_UPDATED,
    hook: usePartyroomNoticeCallback as Mock,
    label: 'usePartyroomNoticeCallback',
  },
  {
    eventType: PartyroomEventType.REACTION_AGGREGATION_UPDATED,
    hook: useReactionAggregationCallback as Mock,
    label: 'useReactionAggregationCallback',
  },
  {
    eventType: PartyroomEventType.REACTION_PERFORMED,
    hook: useReactionMotionCallback as Mock,
    label: 'useReactionMotionCallback',
  },
  {
    eventType: PartyroomEventType.PLAYBACK_STARTED,
    hook: usePlaybackStartCallback as Mock,
    label: 'usePlaybackStartCallback',
  },
  {
    eventType: PartyroomEventType.CHAT_MESSAGE_SENT,
    hook: useChatCallback as Mock,
    label: 'useChatCallback',
  },
  {
    eventType: PartyroomEventType.CREW_GRADE_CHANGED,
    hook: useCrewGradeCallback as Mock,
    label: 'useCrewGradeCallback',
  },
  {
    eventType: PartyroomEventType.CREW_PENALIZED,
    hook: useCrewPenaltyCallback as Mock,
    label: 'useCrewPenaltyCallback',
  },
  {
    eventType: PartyroomEventType.CREW_PROFILE_CHANGED,
    hook: useCrewProfileCallback as Mock,
    label: 'useCrewProfileCallback',
  },
  {
    eventType: PartyroomEventType.DJ_QUEUE_CHANGED,
    hook: useDjQueueChangedCallback as Mock,
    label: 'useDjQueueChangedCallback',
  },
];

function createMessage(body: string) {
  return { body } as any;
}

function setupCallbacks() {
  const callbacks = new Map<PartyroomEventType, Mock>();

  for (const { eventType, hook } of CALLBACK_MAP) {
    const cb = vi.fn();
    hook.mockReturnValue(cb);
    callbacks.set(eventType, cb);
  }

  return callbacks;
}

describe('useHandleSubscriptionEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('유효한 JSON + 알려진 eventType → 해당 콜백이 호출된다', () => {
    const callbacks = setupCallbacks();
    const { result } = renderHook(() => useHandleSubscriptionEvent());
    const handler = result.current;

    const event = { eventType: PartyroomEventType.CHAT_MESSAGE_SENT, message: { content: 'hi' } };
    handler(createMessage(JSON.stringify(event)));

    expect(callbacks.get(PartyroomEventType.CHAT_MESSAGE_SENT)).toHaveBeenCalledWith(event);
  });

  test('유효한 JSON + eventType 없음 → 아무 콜백도 호출되지 않는다', () => {
    const callbacks = setupCallbacks();
    const { result } = renderHook(() => useHandleSubscriptionEvent());
    const handler = result.current;

    handler(createMessage(JSON.stringify({ data: 'no event type' })));

    for (const cb of callbacks.values()) {
      expect(cb).not.toHaveBeenCalled();
    }
  });

  test('유효한 JSON + 알 수 없는 eventType → warn 로그 + 아무 콜백도 호출되지 않는다', () => {
    const callbacks = setupCallbacks();
    const { result } = renderHook(() => useHandleSubscriptionEvent());
    const handler = result.current;

    handler(createMessage(JSON.stringify({ eventType: 'UNKNOWN_EVENT' })));

    expect(warnLog).toHaveBeenCalled();
    for (const cb of callbacks.values()) {
      expect(cb).not.toHaveBeenCalled();
    }
  });

  test('유효하지 않은 JSON → 파싱 실패 warn + 아무 콜백도 호출되지 않는다', () => {
    const callbacks = setupCallbacks();
    const { result } = renderHook(() => useHandleSubscriptionEvent());
    const handler = result.current;

    handler(createMessage('not valid json{{{'));

    expect(warnLog).toHaveBeenCalled();
    for (const cb of callbacks.values()) {
      expect(cb).not.toHaveBeenCalled();
    }
  });

  describe.each(CALLBACK_MAP.map(({ eventType, label }) => ({ eventType, label })))(
    '$eventType',
    ({ eventType, label }) => {
      test(`${label}이 올바르게 호출된다`, () => {
        const callbacks = setupCallbacks();
        const { result } = renderHook(() => useHandleSubscriptionEvent());
        const handler = result.current;

        const event = { eventType };
        handler(createMessage(JSON.stringify(event)));

        expect(callbacks.get(eventType)).toHaveBeenCalledWith(event);

        // 다른 콜백은 호출되지 않아야 한다
        for (const [type, cb] of callbacks.entries()) {
          if (type !== eventType) {
            expect(cb).not.toHaveBeenCalled();
          }
        }
      });
    }
  );
});

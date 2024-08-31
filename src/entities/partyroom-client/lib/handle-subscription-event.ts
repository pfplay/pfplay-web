import { IMessage } from '@stomp/stompjs';
import { PartyroomEventType, PartyroomSubEvent } from '@/shared/api/websocket/types/partyroom';
import { specificLog, warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import useAccessCallback from './subscription-callbacks/use-access-callback.hook';
import useAggregationCallback from './subscription-callbacks/use-aggregation-callback.hook';
import useChatCallback from './subscription-callbacks/use-chat-callback.hook';
import useDeactivationCallback from './subscription-callbacks/use-deactivation-callback.hook';
import useMotionCallback from './subscription-callbacks/use-motion-callback.hook';
import useNoticeCallback from './subscription-callbacks/use-notice-callback.hook';
import usePlaybackCallback from './subscription-callbacks/use-playback-callback.hook';

const logger = withDebugger(0);
const warnLogger = logger(warnLog);
const infoLogger = logger(specificLog);

export default function useHandleSubscriptionEvent() {
  const accessCallback = useAccessCallback();
  const chatCallback = useChatCallback();
  const motionCallback = useMotionCallback();
  const noticeCallback = useNoticeCallback();
  const aggregationCallback = useAggregationCallback();
  const playbackCallback = usePlaybackCallback();
  const deactivationCallback = useDeactivationCallback();

  return (message: IMessage) => {
    const event = parseMessage(message);

    if (!hasEventType(event)) {
      // It's probably a message that hasn't been processed on the backend.
      return;
    }

    if (!isPartyroomSubEvent(event)) {
      warnLogger('Unknown event type:', event);
      return;
    }

    infoLogger('Received event:', event);

    switch (event.eventType) {
      case PartyroomEventType.ACCESS:
        accessCallback(event);
        break;
      case PartyroomEventType.CHAT:
        chatCallback(event);
        break;
      case PartyroomEventType.MOTION:
        motionCallback(event);
        break;
      case PartyroomEventType.NOTICE:
        noticeCallback(event);
        break;
      case PartyroomEventType.AGGREGATION:
        aggregationCallback(event);
        break;
      case PartyroomEventType.PLAYBACK:
        playbackCallback(event);
        break;
      case PartyroomEventType.DEACTIVATION:
        deactivationCallback(event);
        break;
    }
  };
}

function hasEventType(event: Record<string, unknown>): event is { eventType: unknown } {
  return 'eventType' in event;
}

const partyroomEventTypes = new Set(Object.values(PartyroomEventType));

function isPartyroomSubEvent(event: { eventType: unknown }): event is PartyroomSubEvent {
  // @ts-expect-error
  return partyroomEventTypes.has(event.eventType);
}

function parseMessage(message: IMessage): Record<string, unknown> {
  try {
    return JSON.parse(message.body);
  } catch {
    warnLogger('Failed to parse message:', message);
    return {};
  }
}

import { IMessage } from '@stomp/stompjs';
import { PartyroomEventType, PartyroomSubEvent } from '@/shared/api/websocket/types/partyroom';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import accessCallback from './subscription-callbacks/access-callback';
import aggregationCallback from './subscription-callbacks/aggregation-callback';
import chatCallback from './subscription-callbacks/chat-callback';
import deactivationCallback from './subscription-callbacks/deactivation-callback';
import motionCallback from './subscription-callbacks/motion-callback';
import noticeCallback from './subscription-callbacks/notice-callback';
import playbackCallback from './subscription-callbacks/playback-callback';

const logger = withDebugger(0);
const warnLogger = logger(warnLog);

export default function handleSubscriptionEvent(message: IMessage) {
  const event = parseMessage(message);

  if (!hasEventType(event)) {
    // It's probably a message that hasn't been processed on the backend.
    return;
  }

  if (!isPartyroomSubEvent(event)) {
    warnLogger('Unknown event type:', event);
    return;
  }

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

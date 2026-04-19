import { IMessage } from '@stomp/stompjs';
import { PartyroomEventType, PartyroomSubEvent } from '@/shared/api/websocket/types/partyroom';
import { specificLog, warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
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

const logger = withDebugger(0);
const warnLogger = logger(warnLog);
const infoLogger = logger(specificLog);

export default function useHandleSubscriptionEvent() {
  const partyroomCloseCallback = usePartyroomCloseCallback();
  const playbackDeactivatedCallback = usePlaybackDeactivatedCallback();
  const crewEnteredCallback = useCrewEnteredCallback();
  const crewExitedCallback = useCrewExitedCallback();
  const partyroomNoticeCallback = usePartyroomNoticeCallback();
  const reactionAggregationCallback = useReactionAggregationCallback();
  const reactionMotionCallback = useReactionMotionCallback();
  const playbackStartCallback = usePlaybackStartCallback();
  const chatCallback = useChatCallback();
  const crewGradeCallback = useCrewGradeCallback();
  const crewPenaltyCallback = useCrewPenaltyCallback();
  const crewProfileCallback = useCrewProfileCallback();
  const djQueueChangedCallback = useDjQueueChangedCallback();

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
      case PartyroomEventType.PARTYROOM_CLOSED:
        partyroomCloseCallback(event);
        break;
      case PartyroomEventType.PLAYBACK_DEACTIVATED:
        playbackDeactivatedCallback(event);
        break;
      case PartyroomEventType.CREW_ENTERED:
        crewEnteredCallback(event);
        break;
      case PartyroomEventType.CREW_EXITED:
        crewExitedCallback(event);
        break;
      case PartyroomEventType.PARTYROOM_NOTICE_UPDATED:
        partyroomNoticeCallback(event);
        break;
      case PartyroomEventType.REACTION_AGGREGATION_UPDATED:
        reactionAggregationCallback(event);
        break;
      case PartyroomEventType.REACTION_PERFORMED:
        reactionMotionCallback(event);
        break;
      case PartyroomEventType.PLAYBACK_STARTED:
        playbackStartCallback(event);
        break;
      case PartyroomEventType.CHAT_MESSAGE_SENT:
        chatCallback(event);
        break;
      case PartyroomEventType.CREW_GRADE_CHANGED:
        crewGradeCallback(event);
        break;
      case PartyroomEventType.CREW_PENALIZED:
        crewPenaltyCallback(event);
        break;
      case PartyroomEventType.CREW_PROFILE_CHANGED:
        crewProfileCallback(event);
        break;
      case PartyroomEventType.DJ_QUEUE_CHANGED:
        djQueueChangedCallback(event);
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

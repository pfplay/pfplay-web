import { IMessage } from '@stomp/stompjs';
import { PartyroomEventType, PartyroomSubEvent } from '@/shared/api/websocket/types/partyroom';
import { specificLog, warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import useChatCallback from './subscription-callbacks/use-chat-callback.hook';
import useCrewGradeCallback from './subscription-callbacks/use-crew-grade-callback.hook';
import useCrewPenaltyCallback from './subscription-callbacks/use-crew-penalty-callback.hook';
import useCrewProfileCallback from './subscription-callbacks/use-crew-profile-callback.hook';
import usePartyroomAccessCallback from './subscription-callbacks/use-partyroom-access-callback.hook';
import usePartyroomDeactivationCallback from './subscription-callbacks/use-partyroom-deactivation-callback.hook';
import usePartyroomNoticeCallback from './subscription-callbacks/use-partyroom-notice-callback.hook';
import usePlaybackSkipCallback from './subscription-callbacks/use-playback-skip-callback.hook';
import usePlaybackStartCallback from './subscription-callbacks/use-playback-start-callback.hook';
import useReactionAggregationCallback from './subscription-callbacks/use-reaction-aggregation-callback.hook';
import useReactionMotionCallback from './subscription-callbacks/use-reaction-motion-callback.hook';

const logger = withDebugger(0);
const warnLogger = logger(warnLog);
const infoLogger = logger(specificLog);

export default function useHandleSubscriptionEvent() {
  const partyroomDeactivationCallback = usePartyroomDeactivationCallback();
  const partyroomAccessCallback = usePartyroomAccessCallback();
  const partyroomNoticeCallback = usePartyroomNoticeCallback();
  const reactionAggregationCallback = useReactionAggregationCallback();
  const reactionMotionCallback = useReactionMotionCallback();
  const playbackStartCallback = usePlaybackStartCallback();
  const playbackSkipCallback = usePlaybackSkipCallback();
  const chatCallback = useChatCallback();
  const crewGradeCallback = useCrewGradeCallback();
  const crewPenaltyCallback = useCrewPenaltyCallback();
  const crewProfileCallback = useCrewProfileCallback();

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
      case PartyroomEventType.PARTYROOM_DEACTIVATION:
        partyroomDeactivationCallback(event);
        break;
      case PartyroomEventType.PARTYROOM_ACCESS:
        partyroomAccessCallback(event);
        break;
      case PartyroomEventType.PARTYROOM_NOTICE:
        partyroomNoticeCallback(event);
        break;
      case PartyroomEventType.REACTION_AGGREGATION:
        reactionAggregationCallback(event);
        break;
      case PartyroomEventType.REACTION_MOTION:
        reactionMotionCallback(event);
        break;
      case PartyroomEventType.PLAYBACK_START:
        playbackStartCallback(event);
        break;
      case PartyroomEventType.PLAYBACK_SKIP:
        playbackSkipCallback(event);
        break;
      case PartyroomEventType.CHAT:
        chatCallback(event);
        break;
      case PartyroomEventType.CREW_GRADE:
        crewGradeCallback(event);
        break;
      case PartyroomEventType.CREW_PENALTY:
        crewPenaltyCallback(event);
        break;
      case PartyroomEventType.CREW_PROFILE:
        crewProfileCallback(event);
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

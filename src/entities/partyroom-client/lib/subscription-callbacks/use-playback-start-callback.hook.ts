import { PlaybackStartEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useInvalidateDjingQueue from './utils/use-invalidate-djing-queue.hook';

export default function usePlaybackStartCallback() {
  const { useCurrentPartyroom } = useStores();
  const [
    updatePlaybackActivated,
    updatePlayback,
    updateCurrentDj,
    resetReaction,
    resetReactionAggregation,
    resetCrewsMotion,
  ] = useCurrentPartyroom((state) => [
    state.updatePlaybackActivated,
    state.updatePlayback,
    state.updateCurrentDj,
    state.resetReaction,
    state.resetReactionAggregation,
    state.resetCrewsMotion,
  ]);
  const invalidateDjingQueue = useInvalidateDjingQueue();

  return (event: PlaybackStartEvent) => {
    updatePlaybackActivated(true);
    updatePlayback(event.playback);
    updateCurrentDj({ crewId: event.crewId });
    resetReaction();
    resetReactionAggregation();
    resetCrewsMotion();
    invalidateDjingQueue();
  };
}

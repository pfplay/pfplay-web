import { PlaybackStartedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useInvalidateDjingQueue from './utils/use-invalidate-djing-queue.hook';

export default function usePlaybackStartCallback() {
  const { useCurrentPartyroom } = useStores();
  const [
    updatePlaybackActivated,
    updatePlayback,
    updateCurrentDj,
    resetReaction,
    updateReaction,
    resetCrewsMotion,
  ] = useCurrentPartyroom((state) => [
    state.updatePlaybackActivated,
    state.updatePlayback,
    state.updateCurrentDj,
    state.resetReaction,
    state.updateReaction,
    state.resetCrewsMotion,
  ]);
  const invalidateDjingQueue = useInvalidateDjingQueue();

  return (event: PlaybackStartedEvent) => {
    updatePlaybackActivated(true);
    updatePlayback(event.playback);
    updateCurrentDj({ crewId: event.crewId });
    resetReaction();
    updateReaction((prev) => ({
      ...prev,
      aggregation: {
        likeCount: 0,
        dislikeCount: 0,
        grabCount: 0,
      },
    }));
    resetCrewsMotion();
    invalidateDjingQueue();
  };
}

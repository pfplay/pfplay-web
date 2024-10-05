import { PlaybackStartEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useInvalidateDjingQueue from './utils/use-invalidate-djing-queue.hook';

export default function usePlaybackStartCallback() {
  const { useCurrentPartyroom } = useStores();
  const [updatePlaybackActivated, updatePlayback, updateCurrentDj] = useCurrentPartyroom(
    (state) => [state.updatePlaybackActivated, state.updatePlayback, state.updateCurrentDj]
  );
  const invalidateDjingQueue = useInvalidateDjingQueue();

  return (event: PlaybackStartEvent) => {
    updatePlaybackActivated(true);
    updatePlayback(event.playback);
    updateCurrentDj({ crewId: event.crewId });
    invalidateDjingQueue();
  };
}

import { PlaybackEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function usePlaybackCallback() {
  const { useCurrentPartyroom } = useStores();
  const [updatePlaybackActivated, updatePlayback, updateCurrentDj] = useCurrentPartyroom(
    (state) => [state.updatePlaybackActivated, state.updatePlayback, state.updateCurrentDj]
  );

  return (event: PlaybackEvent) => {
    updatePlaybackActivated(true);
    updatePlayback(event.playback);
    updateCurrentDj({ memberId: event.memberId });
  };
}

import { useCallback } from 'react';
import { PlaybackEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function usePlaybackCallback() {
  const { useCurrentPartyroom } = useStores();
  const [updatePlaybackActivated, updatePlayback] = useCurrentPartyroom((state) => [
    state.updatePlaybackActivated,
    state.updatePlayback,
  ]);

  return useCallback(
    (event: PlaybackEvent) => {
      updatePlaybackActivated(true);
      updatePlayback(event.playback);
    },
    [updatePlaybackActivated, updatePlayback]
  );
}

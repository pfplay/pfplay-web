import { PlaybackDeactivatedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function usePlaybackDeactivatedCallback() {
  const { useCurrentPartyroom } = useStores();
  const [
    updatePlaybackActivated,
    updatePlayback,
    updateCurrentDj,
    resetReaction,
    resetCrewsMotion,
  ] = useCurrentPartyroom((state) => [
    state.updatePlaybackActivated,
    state.updatePlayback,
    state.updateCurrentDj,
    state.resetReaction,
    state.resetCrewsMotion,
  ]);

  return (_event: PlaybackDeactivatedEvent) => {
    updatePlaybackActivated(false);
    updatePlayback(() => undefined);
    updateCurrentDj(undefined);
    resetReaction();
    resetCrewsMotion();
  };
}

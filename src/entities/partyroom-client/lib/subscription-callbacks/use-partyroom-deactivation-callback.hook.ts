import { PlaybackDeactivatedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function usePartyroomDeactivationCallback() {
  const { useCurrentPartyroom } = useStores();
  const reset = useCurrentPartyroom((state) => state.reset);

  return (_event: PlaybackDeactivatedEvent) => {
    reset();
  };
}

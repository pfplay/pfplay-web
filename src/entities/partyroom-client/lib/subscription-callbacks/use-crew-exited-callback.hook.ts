import { CrewExitedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCrewExitedCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateCrews = useCurrentPartyroom((state) => state.updateCrews);

  return (event: CrewExitedEvent) => {
    updateCrews((prev) => prev.filter((crew) => crew.crewId !== event.crewId));
  };
}

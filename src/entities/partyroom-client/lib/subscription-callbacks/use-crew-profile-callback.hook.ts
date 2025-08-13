import { CrewProfileEvent } from '@/shared/api/websocket/types/partyroom';
import { omit } from '@/shared/lib/functions/omit';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCrewProfileCallback() {
  const updateCrews = useStores().useCurrentPartyroom((state) => state.updateCrews);

  return (event: CrewProfileEvent) => {
    updateCrews((prev) => {
      const updatedCrews = prev.map((crew) => {
        if (crew.crewId !== event.crewId) {
          return crew;
        }
        const crewUpdated = { ...crew, ...omit(event, 'eventType') };
        return crewUpdated;
      });
      return updatedCrews;
    });
  };
}

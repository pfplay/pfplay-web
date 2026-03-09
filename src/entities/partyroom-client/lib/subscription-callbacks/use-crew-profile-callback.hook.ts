import { CrewProfileChangedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCrewProfileCallback() {
  const updateCrews = useStores().useCurrentPartyroom((state) => state.updateCrews);

  return (event: CrewProfileChangedEvent) => {
    updateCrews((prev) => {
      const updatedCrews = prev.map((crew) => {
        if (crew.crewId !== event.crewId) {
          return crew;
        }
        const crewUpdated = {
          ...crew,
          nickname: event.nickname,
          ...event.avatar,
          avatarFaceUri: event.avatar.avatarFaceUri ?? '',
        };
        return crewUpdated;
      });
      return updatedCrews;
    });
  };
}

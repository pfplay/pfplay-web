import { ReactionMotionEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useReactionMotionCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateCrews = useCurrentPartyroom((state) => state.updateCrews);

  return (event: ReactionMotionEvent) => {
    updateCrews((prev) => {
      return prev.map((crew) => {
        if (crew.crewId === event.crew.crewId) {
          return {
            ...crew,
            motionType: event.motionType,
          };
        }
        return crew;
      });
    });
  };
}

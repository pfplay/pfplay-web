import { MotionEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useMotionCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateCrews = useCurrentPartyroom((state) => state.updateCrews);

  return (event: MotionEvent) => {
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

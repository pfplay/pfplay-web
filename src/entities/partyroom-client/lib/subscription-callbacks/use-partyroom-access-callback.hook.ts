import { AccessType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomAccessEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function usePartyroomAccessCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateCrews = useCurrentPartyroom((state) => state.updateCrews);

  return (event: PartyroomAccessEvent) => {
    switch (event.accessType) {
      case AccessType.ENTER:
        updateCrews((prev) => {
          return [
            ...prev,
            {
              ...event.crew,
              motionType: MotionType.NONE,
            },
          ];
        });
        break;
      case AccessType.EXIT:
        updateCrews((prev) => {
          return prev.filter((crew) => crew.crewId !== event.crew.crewId);
        });
        break;
    }
  };
}

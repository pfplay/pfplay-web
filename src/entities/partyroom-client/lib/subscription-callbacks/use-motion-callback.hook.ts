import { MotionEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useMotionCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateMembers = useCurrentPartyroom((state) => state.updateMembers);

  return (event: MotionEvent) => {
    updateMembers((prev) => {
      return prev.map((member) => {
        if (member.memberId === event.member.memberId) {
          return {
            ...member,
            motionType: event.motionType,
          };
        }
        return member;
      });
    });
  };
}

import { AccessType } from '@/shared/api/http/types/@enums';
import { AccessEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useAccessCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateMembers = useCurrentPartyroom((state) => state.updateMembers);

  return (event: AccessEvent) => {
    switch (event.accessType) {
      case AccessType.ENTER:
        updateMembers((prev) => {
          return [...prev, event.member];
        });
        break;
      case AccessType.EXIT:
        updateMembers((prev) => {
          return prev.filter((member) => member.memberId !== event.member.memberId);
        });
        break;
    }
  };
}

import { PartyroomNoticeUpdatedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function usePartyroomNoticeCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateNotice = useCurrentPartyroom((state) => state.updateNotice);

  return (event: PartyroomNoticeUpdatedEvent) => {
    updateNotice(event.content);
  };
}

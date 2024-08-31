import { NoticeEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useNoticeCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateNotice = useCurrentPartyroom((state) => state.updateNotice);

  return (event: NoticeEvent) => {
    updateNotice(event.content);
  };
}

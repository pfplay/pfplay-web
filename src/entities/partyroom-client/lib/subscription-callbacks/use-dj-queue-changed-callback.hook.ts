import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { DjingQueue } from '@/shared/api/http/types/partyrooms';
import { DjQueueChangedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useDjQueueChangedCallback() {
  const queryClient = useQueryClient();
  const { useCurrentPartyroom } = useStores();
  const partyroomId = useCurrentPartyroom((state) => state.id);

  return (event: DjQueueChangedEvent) => {
    queryClient.setQueryData<DjingQueue>([QueryKeys.DjingQueue, partyroomId], (prev) =>
      prev ? { ...prev, djs: event.djs } : prev
    );
  };
}

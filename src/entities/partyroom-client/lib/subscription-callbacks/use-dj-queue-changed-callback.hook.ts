import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { DjingQueue } from '@/shared/api/http/types/partyrooms';
import { DjQueueChangedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useDjQueueChangedCallback() {
  const queryClient = useQueryClient();
  const { useCurrentPartyroom } = useStores();
  const updateCurrentDj = useCurrentPartyroom((state) => state.updateCurrentDj);

  return (event: DjQueueChangedEvent) => {
    const queryKey = [QueryKeys.DjingQueue, event.partyroomId];
    const currentDj = event.djs.slice().sort((a, b) => a.orderNumber - b.orderNumber)[0];

    updateCurrentDj(currentDj ? { crewId: currentDj.crewId } : undefined);
    queryClient.setQueryData<DjingQueue>(queryKey, (prev) => {
      if (!prev) {
        queryClient.invalidateQueries({ queryKey });
        return prev;
      }

      return { ...prev, djs: event.djs };
    });
  };
}

import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { DjingQueue } from '@/shared/api/http/types/partyrooms';
import { DjQueueChangedEvent } from '@/shared/api/websocket/types/partyroom';

export default function useDjQueueChangedCallback() {
  const queryClient = useQueryClient();

  return (event: DjQueueChangedEvent) => {
    queryClient.setQueryData<DjingQueue>([QueryKeys.DjingQueue, event.partyroomId], (prev) =>
      prev ? { ...prev, djs: event.djs } : prev
    );
  };
}

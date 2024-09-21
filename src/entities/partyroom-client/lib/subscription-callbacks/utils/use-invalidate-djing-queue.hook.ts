import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useInvalidateDjingQueue() {
  const queryClient = useQueryClient();
  const { useCurrentPartyroom } = useStores();
  const partyroomId = useCurrentPartyroom((state) => state.id);

  return () => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.DjingQueue, partyroomId],
    });
  };
}

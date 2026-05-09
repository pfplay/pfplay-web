import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { track } from '@/shared/lib/analytics';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useDeleteDjFromQueueMutation() {
  const queryClient = useQueryClient();
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return useMutation<void, AxiosError<APIError>, string>({
    mutationFn: async (djId) => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      return await partyroomsService.deleteDjFromQueue({
        partyroomId,
        djId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, partyroomId],
      });
      if (partyroomId) {
        track('DJ Deregistered', {
          partyroom_id: partyroomId,
          reason: 'admin',
        });
      }
    },
  });
}

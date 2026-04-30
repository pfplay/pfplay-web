import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { UnregisterMeFromQueuePayload } from '@/shared/api/http/types/djs';
import { track } from '@/shared/lib/analytics';

export const useUnregisterMeFromQueue = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, UnregisterMeFromQueuePayload>({
    mutationFn: (request) => djsService.unregisterMeFromQueue(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
      track('DJ Deregistered', {
        partyroom_id: variables.partyroomId,
        reason: 'self',
      });
    },
  });
};

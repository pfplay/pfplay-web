import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { UnregisterMeFromQueuePayload } from '@/shared/api/http/types/djs';
import { track } from '@/shared/lib/analytics';
import { suppressNextSelfDjDeregister } from '@/shared/lib/analytics/room-tracking';

export const useUnregisterMeFromQueue = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, UnregisterMeFromQueuePayload>({
    mutationFn: (request) => djsService.unregisterMeFromQueue(request),
    onMutate: () => {
      // 직후 DJ_QUEUE_CHANGED WS가 self 제거를 admin으로 잘못 분류하는 것을 방지.
      suppressNextSelfDjDeregister();
    },
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

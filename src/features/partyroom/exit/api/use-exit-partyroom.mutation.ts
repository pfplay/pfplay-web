import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { ExitPayload } from '@/shared/api/http/types/partyrooms';

export function useExitPartyroom() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, ExitPayload>({
    mutationFn: (request) => partyroomsService.exit(request),
    onSuccess: () => {
      /**
       * TODO: 파티 룸 관련 캐시 모두 제거 (crews, djingQueue, etc...)
       */
      queryClient.removeQueries({
        queryKey: [QueryKeys.DjingQueue],
      });
      queryClient.removeQueries({
        queryKey: [QueryKeys.Crews],
      });
    },
  });
}

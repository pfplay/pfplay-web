import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { ImposePenaltyPayload } from '@/shared/api/http/types/partyrooms';

export default function useImposePenaltyMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, ImposePenaltyPayload>({
    mutationFn: (payload) => partyroomsService.imposePenalty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Penalties],
      });
    },
  });
}

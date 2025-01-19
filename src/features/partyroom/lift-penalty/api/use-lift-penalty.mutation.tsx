import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { LiftPenaltyPayload } from '@/shared/api/http/types/partyrooms';

export default function useLiftPenalty() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, LiftPenaltyPayload>({
    mutationFn: (payload) => partyroomsService.liftPenalty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Penalties],
      });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { crewsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { UnblockCrewPayload } from '@/shared/api/http/types/crews';

export default function useUnblockCrew() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, UnblockCrewPayload>({
    mutationFn: (payload) => crewsService.unblockCrew(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.MyBlocks],
      });
    },
  });
}

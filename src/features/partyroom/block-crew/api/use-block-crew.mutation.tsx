import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { crewsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { BlockCrewPayload } from '@/shared/api/http/types/crews';

export default function useBlockCrew() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, BlockCrewPayload>({
    mutationFn: (payload) => crewsService.blockCrew(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.MyBlocks],
      });
    },
  });
}

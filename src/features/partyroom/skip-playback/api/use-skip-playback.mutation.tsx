import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { SkipPlaybackPayload } from '@/shared/api/http/types/djs';

export const useSkipPlayback = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, SkipPlaybackPayload>({
    mutationFn: (request) => djsService.skipPlayback(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
    },
  });
};

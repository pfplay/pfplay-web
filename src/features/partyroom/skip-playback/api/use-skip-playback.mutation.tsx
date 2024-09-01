import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import DjsService from '@/shared/api/http/services/djs';
import { APIError } from '@/shared/api/http/types/@shared';
import { SkipPlaybackPayload } from '@/shared/api/http/types/djs';

export const useSkipPlayback = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, SkipPlaybackPayload>({
    mutationFn: DjsService.skipPlayback,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
    },
  });
};

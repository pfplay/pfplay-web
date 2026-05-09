import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { RegisterMeToQueuePayload } from '@/shared/api/http/types/djs';
import { track } from '@/shared/lib/analytics';

export const useRegisterMeToQueue = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, RegisterMeToQueuePayload>({
    mutationFn: (request) => djsService.registerMeToQueue(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
      track('DJ Registered', {
        partyroom_id: variables.partyroomId,
        playlist_id: variables.playlistId,
      });
    },
  });
};

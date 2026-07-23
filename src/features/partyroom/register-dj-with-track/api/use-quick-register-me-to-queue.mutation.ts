import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { QuickRegisterMeToQueuePayload } from '@/shared/api/http/types/djs';
import { track } from '@/shared/lib/analytics';

export const useQuickRegisterMeToQueue = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, QuickRegisterMeToQueuePayload>({
    mutationFn: (request) => djsService.quickRegisterMeToQueue(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
      // 서버가 플레이리스트를 대신 만들어 담으므로 목록·곡 수가 함께 바뀐다
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
      track('DJ Registered', { partyroom_id: variables.partyroomId });
    },
  });
};

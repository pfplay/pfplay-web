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
        // #471 refetchType:'all' — 등록 시점 DjingQueue 쿼리가 SelectPlaylistSheet/가이드 모달에
        // 가려 inactive 이면 기본 'active' refetch 가 동작하지 않아 등록이 UI 에 반영되지 않는다
        // (백엔드 enqueue 성공·DjQueueChanged 발행에도 큐 캐시가 빈 채로 남음). inactive 까지 강제.
        refetchType: 'all',
      });
      track('DJ Registered', {
        partyroom_id: variables.partyroomId,
        playlist_id: variables.playlistId,
      });
    },
  });
};

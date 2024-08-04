import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { usePartyroomClient } from '@/entities/partyroom-client';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { ExitPayload } from '@/shared/api/http/types/partyrooms';
import { useStores } from '@/shared/lib/store/stores.context';

export function useExitPartyroom() {
  const queryClient = useQueryClient();
  const client = usePartyroomClient();
  const { useCurrentPartyroom } = useStores();
  const resetPartyroom = useCurrentPartyroom((state) => state.reset);

  return useMutation<void, AxiosError<APIError>, ExitPayload>({
    mutationFn: PartyroomsService.exit,
    onSuccess: () => {
      client.unsubscribeAll();
      resetPartyroom();

      /**
       * TODO: 파티 룸 관련 캐시 모두 제거 (members, djingQueue, etc...)
       */
      queryClient.removeQueries({
        queryKey: [QueryKeys.DjingQueue],
      });
    },
  });
}

/**
 * 파티룸 내에서 beforeunload 이벤트가 발생하여, onSuccess 내 동작 없이 오직 exit 요청만 보낼 때 사용합니다.
 */
export function onBeforePartyroomPageUnload(partyroomId: number) {
  return PartyroomsService.exit({ partyroomId });
}

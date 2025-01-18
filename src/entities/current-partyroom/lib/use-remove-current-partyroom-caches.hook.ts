import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useStores } from '@/shared/lib/store/stores.context';

/**
 * 파티룸이 폐쇄되었거나 닫혔을 때, 로비로 돌아감과 동시에 현재 파티룸과 관련된 캐시를 제거하는 훅.
 * suspense로 받은 데이터가 뷰에 보이는 상태에서 캐시를 remove하면 에러가 나니 주의하세요.
 */
export default function useRemoveCurrentPartyroomCaches() {
  const queryClient = useQueryClient();
  const { useCurrentPartyroom } = useStores();

  return () => {
    const partyroomId = useCurrentPartyroom.getState().id;

    queryClient.removeQueries({
      queryKey: [QueryKeys.DjingQueue, partyroomId],
    });
    queryClient.removeQueries({
      queryKey: [QueryKeys.Crews, partyroomId],
    });
    queryClient.removeQueries({
      queryKey: [QueryKeys.PartyroomDetailSummary, partyroomId],
    });
    queryClient.removeQueries({
      queryKey: [QueryKeys.PlaybackHistory, partyroomId],
    });
  };
}

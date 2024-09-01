import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import { useStores } from '@/shared/lib/store/stores.context';

/**
 * 현재 "그랩하기"만 지원 ("그랩 플레이리스트에서 빼기"는 지원 안함)
 */
export function useGrabCurrentPlayback() {
  const queryClient = useQueryClient();
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return useMutation<void, AxiosError<APIError>, void>({
    mutationFn: async () => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      await PartyroomsService.reaction({
        partyroomId,
        reactionType: ReactionType.GRAB,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
}

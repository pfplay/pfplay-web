import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import type { ReactionResponse } from '@/shared/api/http/types/partyrooms';
import { useStores } from '@/shared/lib/store/stores.context';

export function useGrabCurrentPlayback() {
  const queryClient = useQueryClient();
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return useMutation<ReactionResponse, AxiosError<APIError>, void>({
    mutationFn: async () => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      return await partyroomsService.reaction({
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

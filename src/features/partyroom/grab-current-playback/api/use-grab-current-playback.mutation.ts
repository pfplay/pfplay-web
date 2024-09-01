import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import { useStores } from '@/shared/lib/store/stores.context';

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

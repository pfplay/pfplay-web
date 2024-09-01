import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import { useStores } from '@/shared/lib/store/stores.context';

export function useEvaluateCurrentPlayback() {
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return useMutation<void, AxiosError<APIError>, Exclude<ReactionType, ReactionType.GRAB>>({
    mutationFn: async (reactionType) => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      await PartyroomsService.reaction({
        partyroomId,
        reactionType,
      });
    },
  });
}

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { partyroomsService } from '@/shared/api/http/services';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import { ReactionResponse } from '@/shared/api/http/types/partyrooms';
import { track } from '@/shared/lib/analytics';
import { reactionTypeLabel } from '@/shared/lib/analytics/labels';
import { useStores } from '@/shared/lib/store/stores.context';

export function useEvaluateCurrentPlayback() {
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return useMutation<
    ReactionResponse,
    AxiosError<APIError>,
    Exclude<ReactionType, ReactionType.GRAB>
  >({
    mutationFn: async (reactionType) => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      return await partyroomsService.reaction({
        partyroomId,
        reactionType,
      });
    },
    onSuccess: (_, reactionType) => {
      if (!partyroomId) return;
      track('Playback Reacted', {
        partyroom_id: partyroomId,
        reaction_type: reactionTypeLabel(reactionType),
      });
    },
  });
}

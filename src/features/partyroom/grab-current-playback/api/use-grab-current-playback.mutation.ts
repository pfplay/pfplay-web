import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { ReactionType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import type { ReactionResponse } from '@/shared/api/http/types/partyrooms';
import { track } from '@/shared/lib/analytics';
import { reactionTypeLabel } from '@/shared/lib/analytics/labels';
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
      if (!partyroomId) return;
      track('Playback Reacted', {
        partyroom_id: partyroomId,
        reaction_type: reactionTypeLabel(ReactionType.GRAB),
      });
      // GRAB 성공이 server-side에서 플레이리스트 추가까지 동반한 경우만 발화.
      // track_id는 search 경로에서는 YouTube linkId(string), grab 경로에서는
      // backend trackId(number)를 stringify — 형식이 source별로 상이함은
      // 분석 시 source 필터로 분기해 사용 권장.
      if (data.addedTrack) {
        track('Track Added', {
          playlist_id: data.addedTrack.playlistId,
          track_id: String(data.addedTrack.trackId),
          source: 'grab',
        });
      }
    },
  });
}

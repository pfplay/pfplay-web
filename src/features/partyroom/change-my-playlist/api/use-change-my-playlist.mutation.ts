import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { djsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { ChangeMyPlaylistPayload } from '@/shared/api/http/types/djs';
import { track } from '@/shared/lib/analytics';

export const useChangeMyPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, ChangeMyPlaylistPayload>({
    mutationFn: (request) => djsService.changeMyPlaylist(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DjingQueue, variables.partyroomId],
      });
      track('DJ Playlist Changed', {
        partyroom_id: variables.partyroomId,
        playlist_id: variables.playlistId,
      });
    },
  });
};

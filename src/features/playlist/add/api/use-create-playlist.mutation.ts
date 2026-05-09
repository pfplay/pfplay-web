import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  CreatePlaylistRequestBody,
  CreatePlaylistResponse,
} from '@/shared/api/http/types/playlists';
import { identify, track } from '@/shared/lib/analytics';

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePlaylistResponse, AxiosError<APIError>, CreatePlaylistRequestBody>({
    mutationFn: (request) => playlistsService.createPlaylist(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
      track('Playlist Created', { playlist_id: data.id });
      identify({ add: { total_playlists: 1 } });
    },
  });
};

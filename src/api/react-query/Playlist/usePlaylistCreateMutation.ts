import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePlaylistRequestBody } from '@/api/@types/Playlist';
import { PLAYLIST_QUERY_KEY } from '@/api/react-query/Playlist/keys';
import { PlaylistService } from '@/api/services/Playlist';

export const usePlaylistCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePlaylistRequestBody) => PlaylistService.createPlaylist(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PLAYLIST_QUERY_KEY],
      });
    },
  });
};

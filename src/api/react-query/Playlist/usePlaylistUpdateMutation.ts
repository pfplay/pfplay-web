import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdatePlaylistRequestBody } from '@/api/@types/Playlist';
import { PLAYLIST_QUERY_KEY } from '@/api/react-query/Playlist/keys';
import { PlaylistService } from '@/api/services/Playlist';

export const usePlaylistUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, ...params }: UpdatePlaylistRequestBody & { listId: number }) =>
      PlaylistService.updatePlaylist(listId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PLAYLIST_QUERY_KEY],
      });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PLAYLIST_QUERY_KEY } from '@/api/react-query/playlist/keys';
import { PlaylistService } from '@/api/services/playlist';
import { UpdatePlaylistRequestBody } from '@/api/types/playlist';

export const useUpdatePlaylist = () => {
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

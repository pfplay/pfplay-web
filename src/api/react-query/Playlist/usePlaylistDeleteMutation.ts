import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PLAYLIST_QUERY_KEY } from '@/api/react-query/Playlist/keys';
import { PlaylistService } from '@/api/services/Playlist';

export const usePlaylistDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deletePlaylist({ listIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PLAYLIST_QUERY_KEY],
      });
    },
  });
};

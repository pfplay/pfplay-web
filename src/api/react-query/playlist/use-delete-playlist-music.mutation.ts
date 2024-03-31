import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PLAYLIST_MUSICS_QUERY_KEY, PLAYLIST_QUERY_KEY } from '@/api/react-query/playlist/keys';
import { PlaylistService } from '@/api/services/playlist';

export const useDeletePlaylistMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deleteMusicFromPlaylist({ listIds }),
    onSuccess: (data) => {
      data.listIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: [PLAYLIST_MUSICS_QUERY_KEY, id],
        });
        queryClient.invalidateQueries({
          queryKey: [PLAYLIST_QUERY_KEY], // for refetch count
        });
      });
    },
  });
};

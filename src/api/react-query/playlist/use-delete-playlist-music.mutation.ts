import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query-keys';
import { PlaylistService } from '@/shared/api/services/playlist';

export const useDeletePlaylistMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deleteMusicFromPlaylist({ listIds }),
    onSuccess: (data) => {
      data.listIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.PlaylistMusics, id],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.Playlist], // for refetch count
        });
      });
    },
  });
};

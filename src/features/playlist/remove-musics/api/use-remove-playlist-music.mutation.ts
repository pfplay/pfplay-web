import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistService } from '@/shared/api/services/playlist';
import { PlaylistMusic } from '@/shared/api/types/playlist';

export const useRemovePlaylistMusics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (musicIds: PlaylistMusic['musicId'][]) =>
      PlaylistService.removeMusicFromPlaylist({ listIds: musicIds }),
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

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistsService } from '@/shared/api/services/playlists';
import { PlaylistMusic } from '@/shared/api/types/playlists';

export const useRemovePlaylistMusics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (musicIds: PlaylistMusic['musicId'][]) =>
      PlaylistsService.removeMusicFromPlaylist({ listIds: musicIds }),
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

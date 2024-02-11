import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PLAYLIST_MUSICS_QUERY_KEY } from '@/api/react-query/Playlist/keys';
import { PlaylistService } from '@/api/services/Playlist';

export const usePlaylistMusicDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deleteMusicFromPlaylist({ listIds }),
    onSuccess: (data) => {
      data.listIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: [PLAYLIST_MUSICS_QUERY_KEY, id],
        });
      });
    },
  });
};

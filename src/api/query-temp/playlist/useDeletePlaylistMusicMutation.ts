import { useMutation } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistMusicsQuery } from './usePlaylistMusicsQuery';
import { useInvalidatePlaylistQuery } from './usePlaylistQuery';

export const useDeletePlaylistMusicMutation = () => {
  const invalidatePlaylistMusicQuery = useInvalidatePlaylistMusicsQuery();
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deleteMusicFromPlaylist({ listIds }),
    onSuccess: (data) => {
      Promise.all([invalidatePlaylistQuery(), ...data.listIds.map(invalidatePlaylistMusicQuery)]);
    },
  });
};

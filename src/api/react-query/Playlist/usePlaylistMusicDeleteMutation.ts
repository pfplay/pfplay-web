import { useMutation } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistMusicsQuery } from 'api/react-query/Playlist/usePlaylistMusicsQuery';
import { useInvalidatePlaylistQuery } from 'api/react-query/Playlist/usePlaylistQuery';

export const usePlaylistMusicDeleteMutation = () => {
  const invalidatePlaylistMusicQuery = useInvalidatePlaylistMusicsQuery();
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deleteMusicFromPlaylist({ listIds }),
    onSuccess: (data) => {
      Promise.all([invalidatePlaylistQuery(), ...data.listIds.map(invalidatePlaylistMusicQuery)]);
    },
  });
};

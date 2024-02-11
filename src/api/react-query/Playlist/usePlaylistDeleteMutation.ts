import { useMutation } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistQuery } from 'api/react-query/Playlist/usePlaylistQuery';

export const usePlaylistDeleteMutation = () => {
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deletePlaylist({ listIds }),
    onSuccess: () => invalidatePlaylistQuery(),
  });
};

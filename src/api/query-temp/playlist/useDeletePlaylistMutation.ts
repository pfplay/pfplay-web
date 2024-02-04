import { useMutation } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistQuery } from './usePlaylistQuery';

export const useDeletePlaylistMutation = () => {
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deletePlaylist({ listIds }),
    onSuccess: () => invalidatePlaylistQuery(),
  });
};

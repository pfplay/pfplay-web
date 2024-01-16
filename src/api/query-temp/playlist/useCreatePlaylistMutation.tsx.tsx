import { useMutation } from '@tanstack/react-query';
import { CreatePlaylistRequestBody } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistQuery } from './usePlaylistQuery';

export const useCreatePlaylistMutation = () => {
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: (params: CreatePlaylistRequestBody) => PlaylistService.createPlaylist(params),
    onSettled: () => invalidatePlaylistQuery(),
  });
};

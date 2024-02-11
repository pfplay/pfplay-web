import { useMutation } from '@tanstack/react-query';
import { CreatePlaylistRequestBody } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistQuery } from 'api/react-query/Playlist/usePlaylistQuery';

export const usePlaylistCreateMutation = () => {
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: (params: CreatePlaylistRequestBody) => PlaylistService.createPlaylist(params),
    onSuccess: () => invalidatePlaylistQuery(),
  });
};

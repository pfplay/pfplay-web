import { useMutation } from '@tanstack/react-query';
import { UpdatePlaylistRequestBody } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistQuery } from 'api/react-query/Playlist/usePlaylistQuery';

export const usePlaylistUpdateMutation = () => {
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: ({ listId, ...params }: UpdatePlaylistRequestBody & { listId: number }) =>
      PlaylistService.updatePlaylist(listId, params),
    onSuccess: () => invalidatePlaylistQuery(),
  });
};

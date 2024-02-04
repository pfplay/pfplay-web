import { useMutation } from '@tanstack/react-query';
import { UpdatePlaylistRequestBody } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistQuery } from './usePlaylistQuery';

export const useUpdatePlaylistMutation = () => {
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: ({ listId, ...params }: UpdatePlaylistRequestBody & { listId: number }) =>
      PlaylistService.updatePlaylist(listId, params),
    onSuccess: () => invalidatePlaylistQuery(),
  });
};

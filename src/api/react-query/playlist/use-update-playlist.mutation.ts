import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query-keys';
import { PlaylistService } from '@/shared/api/services/playlist';
import { UpdatePlaylistRequestBody } from '@/shared/api/types/playlist';

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, ...params }: UpdatePlaylistRequestBody & { listId: number }) =>
      PlaylistService.updatePlaylist(listId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

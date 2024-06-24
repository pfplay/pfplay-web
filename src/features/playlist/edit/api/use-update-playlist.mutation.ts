import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistsService } from '@/shared/api/services/playlists';
import { UpdatePlaylistRequestBody } from '@/shared/api/types/playlists';

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, ...params }: UpdatePlaylistRequestBody & { listId: number }) =>
      PlaylistsService.updatePlaylist(listId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

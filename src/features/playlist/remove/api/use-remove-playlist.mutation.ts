import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { PlaylistsService } from '@/shared/api/http/services/playlists';

export const useRemovePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistsService.removePlaylist({ listIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

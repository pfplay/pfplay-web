import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';

export const useRemovePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistIds: number[]) => playlistsService.removePlaylist({ playlistIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

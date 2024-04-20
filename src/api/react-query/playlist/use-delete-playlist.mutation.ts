import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PLAYLIST_QUERY_KEY } from '@/api/react-query/playlist/keys';
import { PlaylistService } from '@/shared/api/services/playlist';

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deletePlaylist({ listIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PLAYLIST_QUERY_KEY],
      });
    },
  });
};

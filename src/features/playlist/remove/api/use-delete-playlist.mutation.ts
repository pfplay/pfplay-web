import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistService } from '@/shared/api/services/playlist';

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listIds: number[]) => PlaylistService.deletePlaylist({ listIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistService } from '@/shared/api/services/playlist';
import { AddPlaylistMusicRequestBody } from '@/shared/api/types/playlist';

export const useAddPlaylistMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, ...params }: AddPlaylistMusicRequestBody & { listId: number }) =>
      PlaylistService.addMusicToPlaylist(listId, params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PlaylistMusics, data.playListId],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist], // for refetch count
      });
    },
  });
};

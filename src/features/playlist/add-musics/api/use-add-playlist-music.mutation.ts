import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistsService } from '@/shared/api/services/playlists';
import { AddPlaylistMusicRequestBody } from '@/shared/api/types/playlists';

export const useAddPlaylistMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, ...params }: AddPlaylistMusicRequestBody & { listId: number }) =>
      PlaylistsService.addMusicToPlaylist(listId, params),
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

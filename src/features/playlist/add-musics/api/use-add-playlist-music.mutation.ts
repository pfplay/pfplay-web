import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PlaylistsService from '@/shared/api/http/services/playlists';
import { AddPlaylistMusicRequestBody } from '@/shared/api/http/types/playlists';

export const useAddPlaylistMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, ...params }: AddPlaylistMusicRequestBody & { listId: number }) => {
      return PlaylistsService.addMusicToPlaylist(listId, params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PlaylistMusics, variables.listId],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist], // for refetch count
      });
    },
  });
};

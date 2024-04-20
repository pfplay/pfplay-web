import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PLAYLIST_MUSICS_QUERY_KEY, PLAYLIST_QUERY_KEY } from '@/api/react-query/playlist/keys';
import { PlaylistService } from '@/shared/api/services/playlist';
import { AddPlaylistMusicRequestBody } from '@/shared/api/types/playlist';

export const useAddPlaylistMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, ...params }: AddPlaylistMusicRequestBody & { listId: number }) =>
      PlaylistService.addMusicToPlaylist(listId, params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [PLAYLIST_MUSICS_QUERY_KEY, data.playListId],
      });
      queryClient.invalidateQueries({
        queryKey: [PLAYLIST_QUERY_KEY], // for refetch count
      });
    },
  });
};

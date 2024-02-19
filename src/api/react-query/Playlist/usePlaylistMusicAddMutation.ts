import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddPlaylistMusicRequestBody } from '@/api/@types/Playlist';
import { PLAYLIST_MUSICS_QUERY_KEY, PLAYLIST_QUERY_KEY } from '@/api/react-query/Playlist/keys';
import { PlaylistService } from '@/api/services/Playlist';

export const usePlaylistMusicAddMutation = () => {
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

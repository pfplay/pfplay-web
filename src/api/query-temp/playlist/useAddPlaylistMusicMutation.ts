import { useMutation } from '@tanstack/react-query';
import { AddPlaylistMusicRequestBody } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistMusicsQuery } from './usePlaylistMusicsQuery';
import { useInvalidatePlaylistQuery } from './usePlaylistQuery';

export const useAddPlaylistMusicMutation = () => {
  const invalidatePlaylistMusicsQuery = useInvalidatePlaylistMusicsQuery();
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: ({ listId, ...params }: AddPlaylistMusicRequestBody & { listId: number }) =>
      PlaylistService.addMusicToPlaylist(listId, params),
    onSuccess: (data) => {
      if (data?.playListId) {
        Promise.all([invalidatePlaylistQuery(), invalidatePlaylistMusicsQuery(data.playListId)]);
      }
    },
  });
};

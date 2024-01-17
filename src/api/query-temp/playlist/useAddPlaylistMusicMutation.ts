import { useMutation } from '@tanstack/react-query';
import { AddPlaylistMusicRequestBody } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistMusicsQuery } from './usePlaylistMusicsQuery';

export const useAddPlaylistMusicMutation = () => {
  const invalidatePlaylistMusicsQuery = useInvalidatePlaylistMusicsQuery();
  return useMutation({
    mutationFn: ({ listId, ...params }: AddPlaylistMusicRequestBody & { listId: number }) =>
      PlaylistService.addMusicToPlaylist(listId, params),
    onSettled: (data) => {
      if (data?.playListId) {
        invalidatePlaylistMusicsQuery(data.playListId);
      }
    },
  });
};

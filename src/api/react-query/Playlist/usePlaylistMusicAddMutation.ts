import { useMutation } from '@tanstack/react-query';
import { AddPlaylistMusicRequestBody } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistMusicsQuery } from 'api/react-query/Playlist/usePlaylistMusicsQuery';
import { useInvalidatePlaylistQuery } from 'api/react-query/Playlist/usePlaylistQuery';

export const usePlaylistMusicAddMutation = () => {
  const invalidatePlaylistMusicsQuery = useInvalidatePlaylistMusicsQuery();
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: ({ listId, ...params }: AddPlaylistMusicRequestBody & { listId: number }) =>
      PlaylistService.addMusicToPlaylist(listId, params),
    onSuccess: async (data) => {
      if (data?.playListId) {
        await Promise.all([
          invalidatePlaylistQuery(),
          invalidatePlaylistMusicsQuery(data.playListId),
        ]);
      }
    },
  });
};

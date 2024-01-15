import { useMutation } from '@tanstack/react-query';
import { AddPlaylistMusicRequestBody } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistMusicsQuery } from './usePlaylistMusicsQuery';

export const useAddPlaylistMusicMutation = (listId: number) => {
  const invalidatePlaylistMusicsQuery = useInvalidatePlaylistMusicsQuery();
  return useMutation({
    mutationFn: (params: AddPlaylistMusicRequestBody) =>
      PlaylistService.addMusicToPlaylist(listId, params),
    onSettled: () => invalidatePlaylistMusicsQuery(listId),
  });
};

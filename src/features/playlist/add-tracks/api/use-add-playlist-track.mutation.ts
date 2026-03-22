import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';
import { AddTrackToPlaylistRequestBody } from '@/shared/api/http/types/playlists';

export const useAddPlaylistTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, ...params }: AddTrackToPlaylistRequestBody & { listId: number }) => {
      return playlistsService.addTrackToPlaylist(listId, params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PlaylistTracks, variables.listId],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist], // for refetch count
      });
    },
  });
};

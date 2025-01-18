import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';
import { MoveTrackInPlaylistRequest } from '@/shared/api/http/types/playlists';

export default function useMovePlaylistTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MoveTrackInPlaylistRequest) =>
      playlistsService.moveTrackOrderInPlaylist(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PlaylistTracks, variables.playlistId] });
    },
  });
}

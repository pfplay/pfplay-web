import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';
import { ChangeTrackOrderRequest } from '@/shared/api/http/types/playlists';

export default function useChangeTrackOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ChangeTrackOrderRequest) =>
      playlistsService.changeTrackOrderInPlaylist(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PlaylistTracks, variables.playlistId] });
    },
  });
}

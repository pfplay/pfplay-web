import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { MoveTrackToPlaylistRequest } from '@/shared/api/http/types/playlists';

export const useMovePlaylistTrack = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, MoveTrackToPlaylistRequest>({
    mutationFn: (request) => playlistsService.moveTrackToPlaylist(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PlaylistTracks, variables.playlistId],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PlaylistTracks, variables.targetPlaylistId],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

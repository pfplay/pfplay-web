import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  RemoveTrackFromPlaylistRequestParams,
  RemoveTrackFromPlaylistResponse,
} from '@/shared/api/http/types/playlists';

export const useRemovePlaylistTrack = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RemoveTrackFromPlaylistResponse,
    AxiosError<APIError>,
    RemoveTrackFromPlaylistRequestParams
  >({
    mutationFn: (request) => playlistsService.removeTrackFromPlaylist(request),
    onSuccess: (data) => {
      data.listIds.forEach((listId) => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.PlaylistTracks, listId],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.Playlist], // for refetch count
        });
      });
    },
  });
};

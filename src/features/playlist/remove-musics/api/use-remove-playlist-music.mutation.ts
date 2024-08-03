import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PlaylistsService from '@/shared/api/http/services/playlists';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  RemovePlaylistMusicRequestBody,
  RemovePlaylistMusicResponse,
} from '@/shared/api/http/types/playlists';

export const useRemovePlaylistMusics = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RemovePlaylistMusicResponse,
    AxiosError<APIError>,
    RemovePlaylistMusicRequestBody
  >({
    mutationFn: PlaylistsService.removeMusicsFromPlaylist,
    onSuccess: (data) => {
      data.listIds.forEach((listId) => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.PlaylistMusics, listId],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.Playlist], // for refetch count
        });
      });
    },
  });
};

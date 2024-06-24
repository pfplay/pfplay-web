import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistsService } from '@/shared/api/services/playlists';
import { APIError } from '@/shared/api/types/@shared';
import {
  RemovePlaylistMusicRequestBody,
  RemovePlaylistMusicResponse,
} from '@/shared/api/types/playlists';

export const useRemovePlaylistMusics = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RemovePlaylistMusicResponse,
    AxiosError<APIError>,
    RemovePlaylistMusicRequestBody
  >({
    mutationFn: PlaylistsService.removeMusicFromPlaylist,
    onSuccess: (data) => {
      data.listIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.PlaylistMusics, id],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.Playlist], // for refetch count
        });
      });
    },
  });
};

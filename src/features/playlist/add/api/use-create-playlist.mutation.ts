import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { playlistsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  CreatePlaylistRequestBody,
  CreatePlaylistResponse,
} from '@/shared/api/http/types/playlists';

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePlaylistResponse, AxiosError<APIError>, CreatePlaylistRequestBody>({
    mutationFn: (request) => playlistsService.createPlaylist(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

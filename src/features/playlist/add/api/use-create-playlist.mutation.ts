import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { PlaylistsService } from '@/shared/api/http/services/playlists';
import { APIError } from '@/shared/api/http/types/@shared';
import {
  CreatePlaylistRequestBody,
  CreatePlaylistResponse,
} from '@/shared/api/http/types/playlists';

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePlaylistResponse, AxiosError<APIError>, CreatePlaylistRequestBody>({
    mutationFn: PlaylistsService.createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

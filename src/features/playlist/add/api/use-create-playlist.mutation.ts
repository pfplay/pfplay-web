import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistsService } from '@/shared/api/services/playlists';
import { APIError } from '@/shared/api/types/@shared';
import { CreatePlaylistRequestBody, CreatePlaylistResponse } from '@/shared/api/types/playlists';

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

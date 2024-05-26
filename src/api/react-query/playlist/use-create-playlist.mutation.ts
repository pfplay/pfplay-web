import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query-keys';
import { PlaylistService } from '@/shared/api/services/playlist';
import { APIError } from '@/shared/api/types/@shared';
import { CreatePlaylistRequestBody, CreatePlaylistResponse } from '@/shared/api/types/playlist';

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePlaylistResponse, AxiosError<APIError>, CreatePlaylistRequestBody>({
    mutationFn: PlaylistService.createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist],
      });
    },
  });
};

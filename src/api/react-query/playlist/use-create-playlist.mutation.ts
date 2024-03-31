import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { PLAYLIST_QUERY_KEY } from '@/api/react-query/playlist/keys';
import { PlaylistService } from '@/api/services/playlist';
import { APIError } from '@/api/types/@shared';
import { CreatePlaylistRequestBody, CreatePlaylistResponse } from '@/api/types/playlist';

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePlaylistResponse, AxiosError<APIError>, CreatePlaylistRequestBody>({
    mutationFn: PlaylistService.createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PLAYLIST_QUERY_KEY],
      });
    },
  });
};

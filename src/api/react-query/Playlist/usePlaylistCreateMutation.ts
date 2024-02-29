import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { APIError } from '@/api/@types/@shared';
import { CreatePlaylistRequestBody, CreatePlaylistResponse } from '@/api/@types/Playlist';
import { PLAYLIST_QUERY_KEY } from '@/api/react-query/Playlist/keys';
import { PlaylistService } from '@/api/services/Playlist';

export const usePlaylistCreateMutation = () => {
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

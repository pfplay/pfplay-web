import { useMutation } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import { useInvalidatePlaylistQuery } from './usePlaylistQuery';

export const useUpdatePlaylistMutation = () => {
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    // TODO: API 연동 규격 확인
    mutationFn: (params: any) => PlaylistService.createPlaylist(params),
    onSettled: () => invalidatePlaylistQuery(),
  });
};

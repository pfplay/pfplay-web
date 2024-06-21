import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistService } from '@/shared/api/services/playlist';
import { FIVE_MINUTES, ONE_MINUTE } from '@/shared/config/time';

export const useFetchPlaylists = () => {
  return useQuery({
    queryKey: [QueryKeys.Playlist],
    queryFn: () => PlaylistService.getPlaylists(),
    staleTime: ONE_MINUTE,
    gcTime: FIVE_MINUTES,
  });
};

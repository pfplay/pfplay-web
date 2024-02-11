import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import { FIVE_MINUTES } from '@/constants/time';
import { PLAYLIST_QUERY_KEY } from './keys';

export const usePlaylistQuery = () => {
  return useQuery({
    queryKey: [PLAYLIST_QUERY_KEY],
    queryFn: () => PlaylistService.getPlaylist(),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
  });
};

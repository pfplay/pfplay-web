import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import { PLAYLIST_QUERY_KEY } from './keys';

export const usePlaylistQuery = () => {
  return useQuery({
    queryKey: [PLAYLIST_QUERY_KEY],
    queryFn: () => PlaylistService.getPlaylist(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

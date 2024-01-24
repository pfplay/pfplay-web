import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';

const PLAYLIST_QUERY_KEY = 'PLAYLIST';
export const usePlaylistQuery = () => {
  return useQuery({
    queryKey: [PLAYLIST_QUERY_KEY],
    queryFn: () => PlaylistService.getPlaylist(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useInvalidatePlaylistQuery = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [PLAYLIST_QUERY_KEY] });
};

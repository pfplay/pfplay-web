import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';

const PLAYLIST_MUSIC_QUERY_KEY = 'PLAYLIST_MUSIC';
export const usePlaylistMusicsQuery = (listId: number) => {
  return useQuery({
    queryKey: [PLAYLIST_MUSIC_QUERY_KEY, listId],
    queryFn: () => PlaylistService.getMusicFromPlaylist(listId),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useInvalidatePlaylistMusicsQuery = () => {
  const queryClient = useQueryClient();
  return (listId: number) =>
    queryClient.invalidateQueries({ queryKey: [PLAYLIST_MUSIC_QUERY_KEY, listId] });
};

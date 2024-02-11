import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlaylistMusicParameters } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';

const PLAYLIST_MUSIC_QUERY_KEY = 'PLAYLIST_MUSIC';
export const usePlaylistMusicsQuery = (listId: number, params?: PlaylistMusicParameters) => {
  const pageSize = params?.pageSize || 0;
  return useQuery({
    queryKey: [PLAYLIST_MUSIC_QUERY_KEY, listId, pageSize],
    queryFn: () => PlaylistService.getMusicFromPlaylist(listId, params),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: pageSize > 0,
  });
};

export const useInvalidatePlaylistMusicsQuery = () => {
  const queryClient = useQueryClient();
  return (listId: number) =>
    queryClient.invalidateQueries({ queryKey: [PLAYLIST_MUSIC_QUERY_KEY, listId] });
};

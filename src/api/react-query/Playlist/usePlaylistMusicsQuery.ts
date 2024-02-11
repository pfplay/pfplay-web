import { useQuery } from '@tanstack/react-query';
import { PlaylistMusicParameters } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { PLAYLIST_MUSICS_QUERY_KEY } from './keys';

export const usePlaylistMusicsQuery = (listId: number, params?: PlaylistMusicParameters) => {
  const pageSize = params?.pageSize || 0;
  return useQuery({
    queryKey: [PLAYLIST_MUSICS_QUERY_KEY, listId, pageSize],
    queryFn: () => PlaylistService.getMusicFromPlaylist(listId, params),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: pageSize > 0,
  });
};

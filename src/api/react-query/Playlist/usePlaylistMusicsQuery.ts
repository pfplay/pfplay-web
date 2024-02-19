import { useQuery } from '@tanstack/react-query';
import { PlaylistMusicParameters } from '@/api/@types/Playlist';
import { PlaylistService } from '@/api/services/Playlist';
import { FIVE_MINUTES } from '@/constants/time';
import { PLAYLIST_MUSICS_QUERY_KEY } from './keys';

export const usePlaylistMusicsQuery = (listId: number, params?: PlaylistMusicParameters) => {
  const pageSize = params?.pageSize || 0;
  return useQuery({
    queryKey: [PLAYLIST_MUSICS_QUERY_KEY, listId, pageSize],
    queryFn: () => PlaylistService.getMusicFromPlaylist(listId, params),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    enabled: pageSize > 0,
  });
};

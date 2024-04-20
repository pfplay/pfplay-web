import { useQuery } from '@tanstack/react-query';
import { PlaylistService } from '@/shared/api/services/playlist';
import { PlaylistMusicParameters } from '@/shared/api/types/playlist';
import { FIVE_MINUTES } from '@/shared/config/time';
import { PLAYLIST_MUSICS_QUERY_KEY } from './keys';

export const useFetchPlaylistMusics = (listId: number, params?: PlaylistMusicParameters) => {
  const pageSize = params?.pageSize || 0;
  return useQuery({
    queryKey: [PLAYLIST_MUSICS_QUERY_KEY, listId, pageSize],
    queryFn: () => PlaylistService.getMusicFromPlaylist(listId, params),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    enabled: pageSize > 0,
  });
};

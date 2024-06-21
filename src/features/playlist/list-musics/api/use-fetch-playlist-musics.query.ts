import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistService } from '@/shared/api/services/playlist';
import { PlaylistMusicParameters } from '@/shared/api/types/playlist';
import { FIVE_MINUTES } from '@/shared/config/time';

export const useFetchPlaylistMusics = (listId: number, params?: PlaylistMusicParameters) => {
  const pageSize = params?.pageSize || 0;
  return useQuery({
    queryKey: [QueryKeys.PlaylistMusics, listId, pageSize],
    queryFn: () => PlaylistService.getMusicFromPlaylist(listId, params),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    enabled: pageSize > 0,
  });
};
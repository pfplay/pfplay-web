import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PlaylistsService from '@/shared/api/http/services/playlists';
import { GetPlaylistMusicsParameters } from '@/shared/api/http/types/playlists';
import { FIVE_MINUTES } from '@/shared/config/time';

export const useFetchPlaylistMusics = (listId: number, params?: GetPlaylistMusicsParameters) => {
  const pageSize = params?.pageSize || 0;
  return useQuery({
    queryKey: [QueryKeys.PlaylistMusics, listId, pageSize],
    queryFn: () => PlaylistsService.getMusicsFromPlaylist(listId, params),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    enabled: pageSize > 0,
  });
};

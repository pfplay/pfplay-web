import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PlaylistsService from '@/shared/api/http/services/playlists';
import { APIError } from '@/shared/api/http/types/@shared';
import { MusicListItem, SearchMusicsResponse } from '@/shared/api/http/types/playlists';
import { FIVE_MINUTES } from '@/shared/config/time';

export const useSearchMusics = (search: string) => {
  return useQuery<SearchMusicsResponse, AxiosError<APIError>, MusicListItem[]>({
    queryKey: [QueryKeys.Musics, search],
    queryFn: () =>
      PlaylistsService.searchMusics({
        q: search,
        platform: 'youtube',
      }),
    select: (data) => data.musicList,
    enabled: !!search,
    staleTime: 0,
    gcTime: FIVE_MINUTES,
  });
};

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistsService } from '@/shared/api/services/playlists';
import { APIError } from '@/shared/api/types/@shared';
import { MusicListItem, SearchMusicsResponse } from '@/shared/api/types/playlists';
import { FIVE_MINUTES } from '@/shared/config/time';

export const useSearchMusics = (search: string) => {
  return useQuery<SearchMusicsResponse, AxiosError<APIError>, MusicListItem[]>({
    queryKey: [QueryKeys.PlaylistYoutube, search],
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

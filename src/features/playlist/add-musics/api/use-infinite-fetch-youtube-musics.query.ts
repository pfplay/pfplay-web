import { QueryKey } from '@tanstack/query-core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PlaylistsService } from '@/shared/api/services/playlists';
import { APIError } from '@/shared/api/types/@shared';
import { YoutubeMusic, YoutubeMusicsResponse } from '@/shared/api/types/playlists';
import { FIVE_MINUTES } from '@/shared/config/time';

export const useInfiniteFetchYoutubeMusics = (search: string) => {
  return useInfiniteQuery<
    YoutubeMusicsResponse,
    AxiosError<APIError>,
    YoutubeMusic[],
    QueryKey,
    string | undefined
  >({
    queryKey: [QueryKeys.PlaylistYoutube, search],
    queryFn: ({ pageParam }) =>
      PlaylistsService.getYoutubeMusics({
        q: search,
        pageToken: pageParam,
      }),
    initialPageParam: '', // NOTE: 기본 값을 undefined로 두면, 첫 화면에서 `hasNextPage`가 false가 됩니다.
    getNextPageParam: ({ nextPageToken }) => nextPageToken,
    select: (data) => {
      return data.pages.flatMap((page) => page.musicList);
    },
    enabled: !!search,
    staleTime: 0,
    gcTime: FIVE_MINUTES,
  });
};

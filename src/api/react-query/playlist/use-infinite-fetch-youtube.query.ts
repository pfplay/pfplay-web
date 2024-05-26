import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query-keys';
import { PlaylistService } from '@/shared/api/services/playlist';
import { FIVE_MINUTES } from '@/shared/config/time';
import useIntersectionObserver from '@/shared/lib/hooks/use-intersection-observer.hook';

export const useInfiniteFetchYoutube = (q: string) => {
  const { setRef, isIntersecting } = useIntersectionObserver();
  const { fetchNextPage, ...query } = useInfiniteQuery({
    queryKey: [QueryKeys.PlaylistYoutube, q],
    queryFn: ({ pageParam }) =>
      PlaylistService.getYoutubeMusic({
        q,
        ...(pageParam && { pageToken: pageParam }),
      }),
    initialPageParam: '',
    getNextPageParam: ({ nextPageToken }) => nextPageToken,
    enabled: !!q,
    staleTime: 0,
    gcTime: FIVE_MINUTES,
  });

  useEffect(() => {
    if (!!q && isIntersecting) {
      fetchNextPage();
    }
  }, [q, isIntersecting, fetchNextPage]);

  return {
    setRef,
    ...query,
  };
};

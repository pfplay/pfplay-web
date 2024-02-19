import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import { FIVE_MINUTES } from '@/constants/time';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { PLAYLIST_YOUTUBE_QUERY_KEY } from './keys';

export const useYoutubeInfiniteQuery = (q: string) => {
  const { setRef, isIntersecting } = useIntersectionObserver();
  const { fetchNextPage, ...query } = useInfiniteQuery({
    queryKey: [PLAYLIST_YOUTUBE_QUERY_KEY, q],
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

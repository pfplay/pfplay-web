import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PlaylistService } from '@/api/services/Playlist';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

const YOUTUBE_INFINITE_QUERY_KEY = ['YOUTUBE'];
const useYoutubeInfiniteQuery = (q: string = '') => {
  const { setRef, isIntersecting } = useIntersectionObserver();
  const { fetchNextPage, ...query } = useInfiniteQuery({
    queryFn: ({ pageParam }) =>
      PlaylistService.getYoutubeMusic({
        q,
        ...(pageParam && { pageToken: pageParam }),
      }),
    queryKey: [YOUTUBE_INFINITE_QUERY_KEY, q],
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      return lastPage.nextPageToken;
    },
    enabled: !!q,
  });

  useEffect(() => {
    if (!!q && isIntersecting) {
      fetchNextPage();
    }
  }, [q, isIntersecting, fetchNextPage]);

  return {
    ...query,
    setRef,
  };
};

export default useYoutubeInfiniteQuery;

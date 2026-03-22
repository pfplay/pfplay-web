import { useQueryClient } from '@tanstack/react-query';
import { queryOptions } from '@/entities/me/api/use-fetch-me.query';

export default function usePrefetchMe() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.prefetchQuery(queryOptions);
  };
}

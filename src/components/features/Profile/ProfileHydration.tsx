import { PropsWithChildren } from 'react';
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';
import { ProfileResponse } from '@/api/@types/User';
import { USER_PROFILE_QUERY_KEY } from '@/api/react-query/User/keys';
import { UserService } from '@/api/services/User';
import { getServerAuthSession } from '@/utils/authOptions';

/**
 * @see https://tanstack.com/query/latest/docs/react/guides/advanced-ssr#prefetching-and-dehydrating-data
 */
export const ProfileHydration = async ({ children }: PropsWithChildren) => {
  const session = await getServerAuthSession();
  if (!session) return <>{children}</>;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery<ProfileResponse>({
    queryKey: [USER_PROFILE_QUERY_KEY],
    queryFn: UserService.getProfile,
  });
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
};

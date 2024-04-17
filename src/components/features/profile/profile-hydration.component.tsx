import { PropsWithChildren } from 'react';
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';
import { USER_PROFILE_QUERY_KEY } from '@/api/react-query/user/keys';
import { UserService } from '@/api/services/user';
import { ProfileResponse } from '@/api/types/user';
import { getServerAuthSession } from '@/shared/api/next-auth-options';

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

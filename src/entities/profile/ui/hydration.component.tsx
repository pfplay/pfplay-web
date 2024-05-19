import { PropsWithChildren } from 'react';
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';
import { getServerAuthSession } from '@/shared/api/next-auth-options';
import { QueryKeys } from '@/shared/api/react-query-keys';
import { UserService } from '@/shared/api/services/user';
import { ProfileResponse } from '@/shared/api/types/user';

/**
 * @see https://tanstack.com/query/latest/docs/react/guides/advanced-ssr#prefetching-and-dehydrating-data
 */
export default async function ProfileHydration({ children }: PropsWithChildren) {
  const session = await getServerAuthSession();
  if (!session) return <>{children}</>;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery<ProfileResponse>({
    queryKey: [QueryKeys.MyProfile],
    queryFn: UserService.getProfile,
  });
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}

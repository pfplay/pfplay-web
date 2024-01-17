import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { UserService } from '@/api/services/User';
import { getServerAuthSession } from '@/utils/authOptions';

/**
 * @see https://tanstack.com/query/latest/docs/react/guides/advanced-ssr#prefetching-and-dehydrating-data
 */
export const ProfileHydration = async ({ children }: React.PropsWithChildren) => {
  const queryClient = new QueryClient();
  const session = await getServerAuthSession();

  await queryClient.fetchQuery({
    queryKey: ['PROFILE'],
    queryFn: async () => {
      try {
        if (session) {
          const profile = await UserService.getProfile();

          return profile;
        }
        return {};
      } catch (err) {
        return {};
      }
    },
  });

  const dehydratedState = dehydrate(queryClient);

  return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
};

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/api/services/User';
import { USER_PROFILE_QUERY_KEY } from './keys';

export const useProfileQuery = () => {
  const session = useSession();

  return useQuery({
    queryKey: [USER_PROFILE_QUERY_KEY],
    queryFn: () => UserService.getProfile(),
    gcTime: Infinity,
    staleTime: Infinity,
    enabled: !!session,
  });
};

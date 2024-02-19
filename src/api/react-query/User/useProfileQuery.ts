import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/api/services/User';
import { THIRTY_MINUTES } from '@/constants/time';
import { USER_PROFILE_QUERY_KEY } from './keys';

export const useProfileQuery = () => {
  const session = useSession();

  return useQuery({
    queryKey: [USER_PROFILE_QUERY_KEY],
    queryFn: () => UserService.getProfile(),
    staleTime: THIRTY_MINUTES,
    gcTime: Infinity,
    enabled: !!session,
  });
};

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UserService } from '@/shared/api/services/user';
import { THIRTY_MINUTES } from '@/shared/config/time';

export const useFetchProfile = () => {
  const session = useSession();

  return useQuery({
    queryKey: [QueryKeys.MyProfile],
    queryFn: () => UserService.getProfile(),
    staleTime: THIRTY_MINUTES,
    gcTime: Infinity,
    enabled: !!session,
  });
};

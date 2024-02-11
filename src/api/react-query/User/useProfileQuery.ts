import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/api/services/User';

export const PROFILE_QUERY_KEY = 'PROFILE';
export const useProfileQuery = () => {
  const session = useSession();
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: () => UserService.getProfile(),
    gcTime: Infinity,
    staleTime: Infinity,
    enabled: !!session,
  });
};

export const useInvalidateProfileQuery = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
};

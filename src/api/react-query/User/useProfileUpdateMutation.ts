import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/api/@types/User';
import {
  PROFILE_QUERY_KEY,
  useInvalidateProfileQuery,
} from '@/api/react-query/User/useProfileQuery';
import { UserService } from '@/api/services/User';

export const useProfileUpdateMutation = () => {
  const queryClient = useQueryClient();
  const invalidateProfileQuery = useInvalidateProfileQuery();

  return useMutation({
    mutationFn: (data: UserProfile) => {
      const prev = queryClient.getQueryData<UserProfile>([PROFILE_QUERY_KEY]);
      return UserService.updateProfile({ ...prev, ...data });
    },
    onSuccess: () => {
      invalidateProfileQuery();
    },
  });
};

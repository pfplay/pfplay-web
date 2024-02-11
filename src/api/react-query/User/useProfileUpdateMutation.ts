import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/api/@types/User';
import { USER_PROFILE_QUERY_KEY } from '@/api/react-query/User/keys';
import { UserService } from '@/api/services/User';

export const useProfileUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserProfile) => UserService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_PROFILE_QUERY_KEY],
      });
    },
  });
};

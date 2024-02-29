import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { APIError } from '@/api/@types/@shared';
import { UserProfile } from '@/api/@types/User';
import { USER_PROFILE_QUERY_KEY } from '@/api/react-query/User/keys';
import { UserService } from '@/api/services/User';

export const useProfileUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, AxiosError<APIError>, UserProfile>({
    mutationFn: UserService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_PROFILE_QUERY_KEY],
      });
    },
  });
};

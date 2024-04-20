import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { USER_PROFILE_QUERY_KEY } from '@/api/react-query/user/keys';
import { UserService } from '@/shared/api/services/user';
import { APIError } from '@/shared/api/types/@shared';
import { UserProfile } from '@/shared/api/types/user';

export const useUpdateProfile = () => {
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

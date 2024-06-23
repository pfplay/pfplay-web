import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UsersService } from '@/shared/api/services/users';
import { APIError } from '@/shared/api/types/@shared';
import { UserProfile } from '@/shared/api/types/users';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, AxiosError<APIError>, UserProfile>({
    mutationFn: UsersService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.MyProfile],
      });
    },
  });
};

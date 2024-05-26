import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UserService } from '@/shared/api/services/user';
import { APIError } from '@/shared/api/types/@shared';
import { UserProfile } from '@/shared/api/types/user';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, AxiosError<APIError>, UserProfile>({
    mutationFn: UserService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.MyProfile],
      });
    },
  });
};

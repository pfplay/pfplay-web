import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UsersService } from '@/shared/api/services/users';
import { APIError } from '@/shared/api/types/@shared';
import { UpdateMyBioRequest } from '@/shared/api/types/users';

export const useUpdateMyBio = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, UpdateMyBioRequest>({
    mutationFn: UsersService.updateMyBio,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Me],
      });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { UpdateMyBioRequest } from '@/shared/api/http/types/users';

export const useUpdateMyBio = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, UpdateMyBioRequest>({
    mutationFn: (request) => usersService.updateMyBio(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Me],
      });
    },
  });
};

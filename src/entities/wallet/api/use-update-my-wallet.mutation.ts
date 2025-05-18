import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { UpdateMyWalletRequest } from '@/shared/api/http/types/users';

export default function useUpdateMyWallet() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, UpdateMyWalletRequest>({
    mutationFn: (request) => usersService.updateMyWallet(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Me],
      });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import UsersService from '@/shared/api/http/services/users';
import { APIError } from '@/shared/api/http/types/@shared';
import { UpdateMyWalletRequest } from '@/shared/api/http/types/users';

export function useUpdateMyWallet() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<APIError>, UpdateMyWalletRequest>({
    mutationFn: UsersService.updateMyWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Me],
      });
    },
  });
}

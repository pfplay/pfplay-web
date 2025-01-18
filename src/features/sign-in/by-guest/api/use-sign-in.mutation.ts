import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';

export default function useSignIn() {
  return useMutation<void, AxiosError<APIError>, void>({
    mutationFn: () => usersService.signInGuest(),
  });
}

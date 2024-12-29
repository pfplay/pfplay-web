import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import UsersService from '@/shared/api/http/services/users';
import { APIError } from '@/shared/api/http/types/@shared';

export default function useSignIn() {
  return useMutation<void, AxiosError<APIError>, void>({
    mutationFn: UsersService.signInGuest,
  });
}

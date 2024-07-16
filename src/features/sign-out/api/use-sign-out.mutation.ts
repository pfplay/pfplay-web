import { useMutation } from '@tanstack/react-query';
import UsersService from '@/shared/api/http/services/users';

export default function useSignOut() {
  return useMutation({
    mutationFn: UsersService.signOut,
    onSettled: () => {
      location.href = '/';
    },
  });
}

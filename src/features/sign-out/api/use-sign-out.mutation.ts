import { useMutation } from '@tanstack/react-query';
import UsersService from '@/shared/api/http/services/users';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useSignOut() {
  const markExitedOnBackend = useStores().useCurrentPartyroom((state) => state.markExitedOnBackend);

  return useMutation({
    mutationFn: UsersService.signOut,
    onSettled: () => {
      markExitedOnBackend();
      location.href = '/';
    },
  });
}

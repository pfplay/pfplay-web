import { useMutation } from '@tanstack/react-query';
import { usersService } from '@/shared/api/http/services';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useSignOut() {
  const markExitedOnBackend = useStores().useCurrentPartyroom((state) => state.markExitedOnBackend);

  return useMutation({
    mutationFn: () => usersService.signOut(),
    onSettled: () => {
      markExitedOnBackend();
      location.href = '/';
    },
  });
}

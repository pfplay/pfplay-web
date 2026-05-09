import { useMutation } from '@tanstack/react-query';
import { usersService } from '@/shared/api/http/services';
import { setUserId } from '@/shared/lib/analytics';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useSignOut() {
  const markExitedOnBackend = useStores().useCurrentPartyroom((state) => state.markExitedOnBackend);

  return useMutation({
    mutationFn: () => usersService.signOut(),
    onSettled: () => {
      // Detach the Amplitude user_id; deviceId persists so the next anonymous
      // visit remains continuous, and a fresh login will re-attach a new user.
      setUserId(null);
      markExitedOnBackend();
      location.href = '/';
    },
  });
}

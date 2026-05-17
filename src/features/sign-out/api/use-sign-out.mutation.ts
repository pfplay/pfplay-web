import { useMutation } from '@tanstack/react-query';
import { usersService } from '@/shared/api/http/services';
import { setUserId } from '@/shared/lib/analytics';

export default function useSignOut() {
  return useMutation({
    mutationFn: () => usersService.signOut(),
    onSettled: () => {
      // Detach the Amplitude user_id; deviceId persists so the next anonymous
      // visit remains continuous, and a fresh login will re-attach a new user.
      setUserId(null);
      // 파티룸 클라이언트 정리는 레이아웃 언마운트(teardown)가 수행하며,
      // 서버 세션 만료는 비자발적 이탈로서 presence grace window가 처리한다.
      location.href = '/';
    },
  });
}

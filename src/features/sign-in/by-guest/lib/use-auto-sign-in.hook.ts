import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import isAuthError from '@/shared/api/http/error/is-auth-error';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';

/**
 * 비로그인 상태에서 특정 라우트 직접 접속 시 guest 자동 로그인 수행
 */
export default function useAutoSignIn(error: unknown, enabled: boolean) {
  const queryClient = useQueryClient();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!error || !isAuthError(error) || !enabled || attempted.current) return;

    attempted.current = true;
    setIsSigningIn(true);

    usersService
      .signInGuest()
      .then(() => queryClient.refetchQueries({ queryKey: [QueryKeys.Me] }))
      .catch(() => {
        location.href = '/';
      })
      .finally(() => setIsSigningIn(false));
  }, [error, enabled, queryClient]);

  return { isSigningIn };
}

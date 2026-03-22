import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import isAuthError from '@/shared/api/http/error/is-auth-error';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';

/**
 * 비로그인 상태에서 파티룸 직접 접속 시 guest 자동 로그인 수행
 * POST /v1/users/guests/sign 호출로 게스트 세션 생성
 */
export default function useAutoSignIn(error: unknown, partyroomId: number | null) {
  const queryClient = useQueryClient();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!error || !isAuthError(error) || !partyroomId || attempted.current) return;

    attempted.current = true;
    setIsSigningIn(true);

    usersService
      .signInGuest()
      .then(() => queryClient.refetchQueries({ queryKey: [QueryKeys.Me] }))
      .catch(() => {
        location.href = '/';
      })
      .finally(() => setIsSigningIn(false));
  }, [error, partyroomId, queryClient]);

  return { isSigningIn };
}

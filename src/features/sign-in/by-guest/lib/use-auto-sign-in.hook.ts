import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import isAuthError from '@/shared/api/http/error/is-auth-error';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';

/**
 * 비로그인 상태에서 파티룸 직접 접속 시 guest 자동 로그인 수행
 * /v1/partyrooms/link/{partyroomId}/enter 호출로 게스트 세션 생성
 */
export default function useAutoSignIn(error: unknown, partyroomId: number | null) {
  const queryClient = useQueryClient();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!error || !isAuthError(error) || !partyroomId || attempted.current) return;

    attempted.current = true;
    setIsSigningIn(true);

    partyroomsService
      .getPartyroomDetailSummary({ partyroomId })
      .then(({ linkDomain }) => partyroomsService.enterByLink({ linkDomain }))
      .then(() => queryClient.refetchQueries({ queryKey: [QueryKeys.Me] }))
      .catch(() => {
        location.href = '/';
      })
      .finally(() => setIsSigningIn(false));
  }, [error, partyroomId, queryClient]);

  return { isSigningIn };
}

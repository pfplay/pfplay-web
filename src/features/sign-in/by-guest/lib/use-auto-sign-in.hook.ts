import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hadMemberSession } from '@/entities/me/lib/member-session';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import { trackSignedIn } from '@/shared/lib/analytics/auth-tracking';
import { classifyAuthError } from './classify-auth-error';
import { reauthenticate } from './reauthenticate';

/**
 * 파티룸 컨텍스트의 401을 분류해 라우팅한다. (#428, platform#306)
 * - VISITOR(비로그인 방문자·링크-도메인 직접 진입): 게스트 자동 로그인.
 * - EXPIRED_MEMBER(만료된 회원): 게스트 강등 대신 재로그인 유도(reauthenticate).
 */
export default function useAutoSignIn(error: unknown, partyroomId: number | null) {
  const queryClient = useQueryClient();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;

    const decision = classifyAuthError({
      error,
      partyroomId,
      hadMemberSession: hadMemberSession(),
    });
    if (decision === 'IGNORE') return;

    attempted.current = true;

    if (decision === 'EXPIRED_MEMBER') {
      // returnTo = 룸 pathname(쿼리 제외). 향후 refresh 는 reauthenticate 내부에서 흡수.
      reauthenticate(window.location.pathname);
      return;
    }

    // VISITOR — 기존 게스트 자동 로그인 (링크-도메인 직접 진입 포함)
    setIsSigningIn(true);
    usersService
      .signInGuest()
      .then(() => {
        trackSignedIn(AuthorityTier.GT);
        return queryClient.refetchQueries({ queryKey: [QueryKeys.Me] });
      })
      .catch(() => {
        location.href = '/';
      })
      .finally(() => setIsSigningIn(false));
  }, [error, partyroomId, queryClient]);

  return { isSigningIn };
}

import { AuthorityTier } from '@/shared/api/http/types/@enums';
import type { OAuth2Provider } from '@/shared/api/http/types/users';

import type { AuthType } from './events';
import { getCurrentUserId, identify, setUserId, track } from './index';

export function authTypeOf(authorityTier: AuthorityTier): AuthType {
  return authorityTier === AuthorityTier.GT ? 'guest' : 'member';
}

export type IdentifyAuthArgs = {
  uid: string;
  authorityTier: AuthorityTier;
  oauthProvider?: OAuth2Provider;
};

export function identifyAuthenticatedUser({
  uid,
  authorityTier,
  oauthProvider,
}: IdentifyAuthArgs): void {
  // ADR-012 (Phase 1 = B): setUserId 직전 현재(GUEST) amplitude id 를 캡처.
  // canonical_user_id 는 한 사람의 최초 id — GUEST·MEMBER 양쪽 user 에 동일 값을
  // setOnce pin 하여 가입 전후 행동을 Cohort/SQL join 으로 잇는다.
  const previousUserId = getCurrentUserId();
  const canonicalUserId = previousUserId ?? uid;

  // GUEST user 측에도 같은 anchor 를 박는다 (setUserId 로 전환되기 전이라
  // 이 identify 는 GUEST id 에 귀속). previousUserId 가 이미 uid 면(재로그인 등)
  // setUserId 후 한 번만 박아도 충분하므로 생략.
  if (previousUserId && previousUserId !== uid) {
    identify({ setOnce: { canonical_user_id: canonicalUserId } });
  }

  setUserId(uid);
  identify({
    set: {
      auth_type: authTypeOf(authorityTier),
      authority_tier: authorityTier,
      ...(oauthProvider ? { oauth_provider: oauthProvider } : {}),
    },
    setOnce: { canonical_user_id: canonicalUserId },
  });
}

export function trackSignedIn(authorityTier: AuthorityTier): void {
  track('User Signed In', { auth_type: authTypeOf(authorityTier) });
}

export function trackSignedUp(oauthProvider: OAuth2Provider): void {
  track('User Signed Up', { provider: oauthProvider });
}

import { AuthorityTier } from '@/shared/api/http/types/@enums';
import type { OAuth2Provider } from '@/shared/api/http/types/users';

import type { AuthType } from './events';
import { identify, setUserId, track } from './index';

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
  setUserId(uid);
  identify({
    set: {
      auth_type: authTypeOf(authorityTier),
      authority_tier: authorityTier,
      ...(oauthProvider ? { oauth_provider: oauthProvider } : {}),
    },
  });
}

export function trackSignedIn(authorityTier: AuthorityTier): void {
  track('User Signed In', { auth_type: authTypeOf(authorityTier) });
}

export function trackSignedUp(oauthProvider: OAuth2Provider): void {
  track('User Signed Up', { provider: oauthProvider });
}

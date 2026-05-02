import { AuthorityTier } from '@/shared/api/http/types/@enums';
import type { OAuth2Provider } from '@/shared/api/http/types/users';

import type { AuthType } from './events';
import { identify, setUserId, track } from './index';

const SEEN_UIDS_STORAGE_KEY = 'pfp_amplitude_seen_uids';

export function authTypeOf(authorityTier: AuthorityTier): AuthType {
  return authorityTier === AuthorityTier.GT ? 'guest' : 'member';
}

function readSeenUids(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_UIDS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === 'string'));
  } catch {
    return new Set();
  }
}

function writeSeenUids(uids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SEEN_UIDS_STORAGE_KEY, JSON.stringify(Array.from(uids)));
  } catch {
    /* localStorage unavailable (privacy mode, quota) — degrade silently */
  }
}

export function isFirstTimeSeen(uid: string): boolean {
  return !readSeenUids().has(uid);
}

export function markUidSeen(uid: string): void {
  const seen = readSeenUids();
  if (seen.has(uid)) return;
  seen.add(uid);
  writeSeenUids(seen);
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

export type TrackSignedUpArgs = {
  uid: string;
  oauthProvider: OAuth2Provider;
};

export function trackSignedUpIfFirstTime({ uid, oauthProvider }: TrackSignedUpArgs): boolean {
  if (!isFirstTimeSeen(uid)) return false;
  track('User Signed Up', { provider: oauthProvider });
  markUidSeen(uid);
  return true;
}

export const __testing__ = {
  SEEN_UIDS_STORAGE_KEY,
};

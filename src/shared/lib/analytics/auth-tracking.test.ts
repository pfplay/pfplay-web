import * as amplitude from '@amplitude/analytics-browser';

import { AuthorityTier } from '@/shared/api/http/types/@enums';

import {
  __testing__,
  identifyAuthenticatedUser,
  isFirstTimeSeen,
  markUidSeen,
  trackSignedIn,
  trackSignedUpIfFirstTime,
} from './auth-tracking';
import { __resetForTests } from './index';

vi.mock('@amplitude/analytics-browser', () => {
  function Identify(this: {
    set: ReturnType<typeof vi.fn>;
    setOnce: ReturnType<typeof vi.fn>;
    add: ReturnType<typeof vi.fn>;
  }) {
    /* constructor body intentionally empty — methods on prototype */
  }
  Identify.prototype.set = vi.fn();
  Identify.prototype.setOnce = vi.fn();
  Identify.prototype.add = vi.fn();

  return {
    init: vi.fn(),
    track: vi.fn(),
    setUserId: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    Identify,
  };
});

const TEST_API_KEY = 'test-amplitude-key';

const identifyProto = (
  amplitude.Identify as unknown as {
    prototype: {
      set: ReturnType<typeof vi.fn>;
      setOnce: ReturnType<typeof vi.fn>;
      add: ReturnType<typeof vi.fn>;
    };
  }
).prototype;

describe('auth-tracking', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_AMPLITUDE_API_KEY', TEST_API_KEY);
    __resetForTests();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('seen-UID tracking', () => {
    test('first call returns true for unknown uid', () => {
      expect(isFirstTimeSeen('uid-1')).toBe(true);
    });

    test('after marking, isFirstTimeSeen returns false', () => {
      markUidSeen('uid-1');
      expect(isFirstTimeSeen('uid-1')).toBe(false);
    });

    test('persists multiple uids independently', () => {
      markUidSeen('uid-1');
      markUidSeen('uid-2');
      expect(isFirstTimeSeen('uid-1')).toBe(false);
      expect(isFirstTimeSeen('uid-2')).toBe(false);
      expect(isFirstTimeSeen('uid-3')).toBe(true);
    });

    test('writes JSON array to localStorage', () => {
      markUidSeen('uid-1');
      const raw = window.localStorage.getItem(__testing__.SEEN_UIDS_STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw as string)).toEqual(['uid-1']);
    });

    test('tolerates corrupted storage gracefully', () => {
      window.localStorage.setItem(__testing__.SEEN_UIDS_STORAGE_KEY, 'not-json{');
      expect(isFirstTimeSeen('uid-1')).toBe(true);
    });
  });

  describe('trackSignedIn', () => {
    test('emits guest auth_type for AuthorityTier.GT', () => {
      trackSignedIn(AuthorityTier.GT);
      expect(amplitude.track).toHaveBeenCalledWith('User Signed In', { auth_type: 'guest' });
    });

    test('emits member auth_type for AuthorityTier.AM', () => {
      trackSignedIn(AuthorityTier.AM);
      expect(amplitude.track).toHaveBeenCalledWith('User Signed In', { auth_type: 'member' });
    });

    test('emits member auth_type for AuthorityTier.FM', () => {
      trackSignedIn(AuthorityTier.FM);
      expect(amplitude.track).toHaveBeenCalledWith('User Signed In', { auth_type: 'member' });
    });
  });

  describe('trackSignedUpIfFirstTime', () => {
    test('emits and marks on first call', () => {
      const result = trackSignedUpIfFirstTime({ uid: 'uid-1', oauthProvider: 'google' });
      expect(result).toBe(true);
      expect(amplitude.track).toHaveBeenCalledWith('User Signed Up', { provider: 'google' });
      expect(isFirstTimeSeen('uid-1')).toBe(false);
    });

    test('does not emit on second call for same uid', () => {
      trackSignedUpIfFirstTime({ uid: 'uid-1', oauthProvider: 'google' });
      vi.clearAllMocks();
      const result = trackSignedUpIfFirstTime({ uid: 'uid-1', oauthProvider: 'google' });
      expect(result).toBe(false);
      expect(amplitude.track).not.toHaveBeenCalled();
    });
  });

  describe('identifyAuthenticatedUser', () => {
    test('sets userId and applies auth_type / authority_tier user properties', () => {
      identifyAuthenticatedUser({ uid: 'uid-1', authorityTier: AuthorityTier.FM });
      expect(amplitude.setUserId).toHaveBeenCalledWith('uid-1');
      expect(identifyProto.set).toHaveBeenCalledWith('auth_type', 'member');
      expect(identifyProto.set).toHaveBeenCalledWith('authority_tier', 'FM');
    });

    test('includes oauth_provider when provided', () => {
      identifyAuthenticatedUser({
        uid: 'uid-1',
        authorityTier: AuthorityTier.FM,
        oauthProvider: 'google',
      });
      expect(identifyProto.set).toHaveBeenCalledWith('oauth_provider', 'google');
    });

    test('omits oauth_provider when not provided', () => {
      identifyAuthenticatedUser({ uid: 'uid-1', authorityTier: AuthorityTier.GT });
      const setCalls = identifyProto.set.mock.calls.map((call) => call[0]);
      expect(setCalls).not.toContain('oauth_provider');
    });
  });
});

import * as amplitude from '@amplitude/analytics-browser';

import { AuthorityTier } from '@/shared/api/http/types/@enums';

import { identifyAuthenticatedUser, trackSignedIn, trackSignedUp } from './auth-tracking';
import { __preloadSdkForTests, __resetForTests } from './index';

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
    getUserId: vi.fn(),
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
    __preloadSdkForTests(amplitude);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

  describe('trackSignedUp', () => {
    test('emits provider on User Signed Up', () => {
      trackSignedUp('google');
      expect(amplitude.track).toHaveBeenCalledWith('User Signed Up', { provider: 'google' });
    });

    test('emits twitter provider', () => {
      trackSignedUp('twitter');
      expect(amplitude.track).toHaveBeenCalledWith('User Signed Up', { provider: 'twitter' });
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

  describe('canonical_user_id pinning (ADR-012 Phase 1 = B)', () => {
    test('GUEST id 존재 & uid 와 다르면 GUEST·MEMBER 양쪽에 canonical pin + 순서(GUEST identify → setUserId → MEMBER identify)', () => {
      (amplitude.getUserId as ReturnType<typeof vi.fn>).mockReturnValue('guest-account-id');

      identifyAuthenticatedUser({ uid: 'member-uid-1', authorityTier: AuthorityTier.FM });

      expect(amplitude.setUserId).toHaveBeenCalledWith('member-uid-1');
      expect(identifyProto.setOnce).toHaveBeenCalledWith('canonical_user_id', 'guest-account-id');
      // GUEST 측 + MEMBER 측 = identify 2회 호출, setUserId 가 그 사이.
      expect(amplitude.identify).toHaveBeenCalledTimes(2);
      const firstIdentifyOrder = (amplitude.identify as ReturnType<typeof vi.fn>).mock
        .invocationCallOrder[0];
      const setUserIdOrder = (amplitude.setUserId as ReturnType<typeof vi.fn>).mock
        .invocationCallOrder[0];
      const secondIdentifyOrder = (amplitude.identify as ReturnType<typeof vi.fn>).mock
        .invocationCallOrder[1];
      expect(firstIdentifyOrder).toBeLessThan(setUserIdOrder);
      expect(setUserIdOrder).toBeLessThan(secondIdentifyOrder);
    });

    test('GUEST id 미상(SDK 미로드) 면 canonical=uid, GUEST 측 pre-pin 생략', () => {
      (amplitude.getUserId as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

      identifyAuthenticatedUser({ uid: 'member-uid-2', authorityTier: AuthorityTier.FM });

      expect(amplitude.setUserId).toHaveBeenCalledWith('member-uid-2');
      expect(identifyProto.setOnce).toHaveBeenCalledWith('canonical_user_id', 'member-uid-2');
      expect(amplitude.identify).toHaveBeenCalledTimes(1); // MEMBER 측 1회만
    });

    test('현재 id 가 이미 uid (재로그인) 면 GUEST 측 pre-pin 생략, canonical=uid', () => {
      (amplitude.getUserId as ReturnType<typeof vi.fn>).mockReturnValue('member-uid-3');

      identifyAuthenticatedUser({ uid: 'member-uid-3', authorityTier: AuthorityTier.AM });

      expect(identifyProto.setOnce).toHaveBeenCalledWith('canonical_user_id', 'member-uid-3');
      expect(amplitude.identify).toHaveBeenCalledTimes(1);
    });
  });
});

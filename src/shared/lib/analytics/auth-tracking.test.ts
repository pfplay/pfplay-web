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
});

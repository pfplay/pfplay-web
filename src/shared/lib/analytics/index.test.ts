import * as amplitude from '@amplitude/analytics-browser';

import {
  __preloadSdkForTests,
  __resetForTests,
  identify,
  initAnalytics,
  resetAnalyticsUser,
  setUserId,
  track,
} from './index';

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

describe('analytics module', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_AMPLITUDE_API_KEY', TEST_API_KEY);
    __resetForTests();
    __preloadSdkForTests(amplitude);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('initAnalytics', () => {
    test('initializes amplitude with API key on first call', () => {
      initAnalytics();
      expect(amplitude.init).toHaveBeenCalledTimes(1);
      expect(amplitude.init).toHaveBeenCalledWith(TEST_API_KEY, undefined, {
        defaultTracking: false,
        autocapture: false,
      });
    });

    test('is idempotent — second call is a no-op', () => {
      initAnalytics();
      initAnalytics();
      expect(amplitude.init).toHaveBeenCalledTimes(1);
    });

    test('does nothing when API key is empty', () => {
      vi.stubEnv('NEXT_PUBLIC_AMPLITUDE_API_KEY', '');
      initAnalytics();
      expect(amplitude.init).not.toHaveBeenCalled();
    });
  });

  describe('track', () => {
    test('forwards event name and properties to amplitude.track', () => {
      track('User Signed In', { auth_type: 'guest' });
      expect(amplitude.track).toHaveBeenCalledWith('User Signed In', { auth_type: 'guest' });
    });

    test('forwards undefined properties when omitted', () => {
      track('Session Started');
      expect(amplitude.track).toHaveBeenCalledWith('Session Started', undefined);
    });

    test('no-ops when API key is empty', () => {
      vi.stubEnv('NEXT_PUBLIC_AMPLITUDE_API_KEY', '');
      track('User Signed In', { auth_type: 'guest' });
      expect(amplitude.track).not.toHaveBeenCalled();
    });
  });

  describe('setUserId', () => {
    test('forwards uid to amplitude.setUserId', () => {
      setUserId('uid-123');
      expect(amplitude.setUserId).toHaveBeenCalledWith('uid-123');
    });

    test('translates null to undefined for amplitude.setUserId', () => {
      setUserId(null);
      expect(amplitude.setUserId).toHaveBeenCalledWith(undefined);
    });
  });

  describe('identify', () => {
    test('builds Identify with set ops and calls amplitude.identify', () => {
      identify({ set: { auth_type: 'member', authority_tier: 'FM' } });
      expect(identifyProto.set).toHaveBeenCalledWith('auth_type', 'member');
      expect(identifyProto.set).toHaveBeenCalledWith('authority_tier', 'FM');
      expect(amplitude.identify).toHaveBeenCalledTimes(1);
    });

    test('uses setOnce for has_created_partyroom', () => {
      identify({ setOnce: { has_created_partyroom: true } });
      expect(identifyProto.setOnce).toHaveBeenCalledWith('has_created_partyroom', true);
    });

    test('uses add for total_playlists', () => {
      identify({ add: { total_playlists: 1 } });
      expect(identifyProto.add).toHaveBeenCalledWith('total_playlists', 1);
    });

    test('does not call amplitude.identify when ops are empty', () => {
      identify({});
      expect(amplitude.identify).not.toHaveBeenCalled();
    });

    test('skips undefined values', () => {
      identify({ set: { auth_type: undefined, authority_tier: 'GT' } });
      const setCalls = identifyProto.set.mock.calls.map((call) => call[0]);
      expect(setCalls).toEqual(['authority_tier']);
    });
  });

  describe('resetAnalyticsUser', () => {
    test('calls amplitude.reset', () => {
      resetAnalyticsUser();
      expect(amplitude.reset).toHaveBeenCalledTimes(1);
    });
  });
});

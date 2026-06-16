vi.mock('@/shared/api/http/services');
vi.mock('@/shared/lib/localization/lang.context');

import { renderHook, act, waitFor } from '@testing-library/react';
import { pushService } from '@/shared/api/http/services';
import { Language } from '@/shared/lib/localization/constants';
import { useLang } from '@/shared/lib/localization/lang.context';
import usePushSubscription from './use-push-subscription';

const ENDPOINT = 'https://push.example.com/sub/abc';

const mockSubscribe = pushService.subscribe as unknown as Mock;
const mockUnsubscribe = pushService.unsubscribe as unknown as Mock;

// PushSubscription stub (toJSON().keys 형태)
function makeSubscription(overrides: Partial<{ unsubscribe: Mock }> = {}) {
  return {
    endpoint: ENDPOINT,
    toJSON: () => ({ endpoint: ENDPOINT, keys: { p256dh: 'P256DH_KEY', auth: 'AUTH_KEY' } }),
    unsubscribe: overrides.unsubscribe ?? vi.fn().mockResolvedValue(true),
  };
}

let mockGetSubscription: Mock;
let mockPMSubscribe: Mock;
let mockRequestPermission: Mock;

function setupBrowser({
  permission = 'default',
  existing = null as ReturnType<typeof makeSubscription> | null,
}: {
  permission?: NotificationPermission;
  existing?: ReturnType<typeof makeSubscription> | null;
} = {}) {
  mockGetSubscription = vi.fn().mockResolvedValue(existing);
  mockPMSubscribe = vi.fn().mockResolvedValue(makeSubscription());
  mockRequestPermission = vi.fn().mockResolvedValue('granted');

  const pushManager = {
    getSubscription: mockGetSubscription,
    subscribe: mockPMSubscribe,
  };

  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));

  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: {
      ready: Promise.resolve({ pushManager }),
    },
  });

  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });

  vi.stubGlobal('PushManager', class {});
  vi.stubGlobal('Notification', {
    permission,
    requestPermission: mockRequestPermission,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  (useLang as Mock).mockReturnValue(Language.Ko);
  mockSubscribe.mockResolvedValue({ subscriptionId: 1 });
  mockUnsubscribe.mockResolvedValue(undefined);
  setupBrowser();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('usePushSubscription - 초기 status', () => {
  test('기존 구독 없으면 off', async () => {
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe('off'));
  });

  test('기존 구독 있으면 on', async () => {
    setupBrowser({ existing: makeSubscription() });
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe('on'));
  });

  test('권한 denied 면 denied', async () => {
    setupBrowser({ permission: 'denied' });
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe('denied'));
  });
});

describe('usePushSubscription - enable', () => {
  test('권한 거부되면 status denied + pushService.subscribe 미호출', async () => {
    setupBrowser();
    mockRequestPermission.mockResolvedValue('denied');
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe('off'));

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.status).toBe('denied');
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  test('권한 허용되면 subscribe 호출 + status on (KO lang)', async () => {
    setupBrowser();
    (useLang as Mock).mockReturnValue(Language.Ko);
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe('off'));

    await act(async () => {
      await result.current.enable();
    });

    expect(mockPMSubscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true })
    );
    expect(mockSubscribe).toHaveBeenCalledWith({
      endpoint: ENDPOINT,
      p256dh: 'P256DH_KEY',
      auth: 'AUTH_KEY',
      lang: 'KO',
    });
    expect(result.current.status).toBe('on');
  });

  test('lang En 이면 lang EN 으로 정규화', async () => {
    setupBrowser();
    (useLang as Mock).mockReturnValue(Language.En);
    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe('off'));

    await act(async () => {
      await result.current.enable();
    });

    expect(mockSubscribe).toHaveBeenCalledWith(expect.objectContaining({ lang: 'EN' }));
  });
});

describe('usePushSubscription - disable', () => {
  test('기존 구독을 unsubscribe(브라우저+서버) 하고 status off', async () => {
    const browserUnsub = vi.fn().mockResolvedValue(true);
    const existing = makeSubscription({ unsubscribe: browserUnsub });
    setupBrowser({ existing, permission: 'granted' });

    const { result } = renderHook(() => usePushSubscription());
    await waitFor(() => expect(result.current.status).toBe('on'));

    await act(async () => {
      await result.current.disable();
    });

    expect(browserUnsub).toHaveBeenCalled();
    expect(mockUnsubscribe).toHaveBeenCalledWith({ endpoint: ENDPOINT });
    expect(result.current.status).toBe('off');
  });
});

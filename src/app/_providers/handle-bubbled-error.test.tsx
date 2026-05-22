vi.mock('@/shared/api/http/error/is-auth-error', () => ({ default: vi.fn() }));
vi.mock('@/shared/lib/decorators/skip-global-error-handling', () => ({
  shouldSkipGlobalErrorHandling: vi.fn(() => false),
}));
vi.mock('@/shared/api/http/error/get-error-message', () => ({
  getErrorMessage: vi.fn(() => 'msg'),
}));
const dialogOpen = vi.fn(() => ({ destroy: vi.fn() }));
vi.mock('@/shared/ui/components/dialog', () => ({
  Dialog: Object.assign((_p: unknown) => null, {
    open: (...a: unknown[]) => dialogOpen(...a),
    ButtonGroup: (_p: unknown) => null,
    Button: (_p: unknown) => null,
  }),
}));

import isAuthError from '@/shared/api/http/error/is-auth-error';
import { handleBubbledError } from './handle-bubbled-error';

type Mock = ReturnType<typeof vi.fn>;

function setPath(pathname: string) {
  Object.defineProperty(global, 'window', {
    value: { location: { href: '', pathname } },
    writable: true,
    configurable: true,
  });
}

const authErr = { isAxiosError: true, response: { status: 401 } };

const originalWindow = global.window;

afterEach(() => {
  Object.defineProperty(global, 'window', {
    value: originalWindow,
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  (isAuthError as Mock).mockReturnValue(true);
});

describe('handleBubbledError — public-route redirect 억제 (B②, #303)', () => {
  test.each(['/sign-in', '/docs', '/docs/terms', '/auth/callback', '/parties/123'])(
    'public/guest-auto-login 경로(%s)에선 401 이어도 redirect 안 함',
    (pathname) => {
      setPath(pathname);
      handleBubbledError(authErr);
      expect(window.location.href).toBe('');
    }
  );

  test('보호 라우트(/parties)의 401 은 / 로 redirect (기존 동작 보존)', () => {
    setPath('/parties');
    handleBubbledError(authErr);
    expect(window.location.href).toBe('/');
  });

  test('public prefix 의 부분문자열 라우트(/foo/sign-in)는 보호 취급 → redirect', () => {
    setPath('/foo/sign-in');
    handleBubbledError(authErr);
    expect(window.location.href).toBe('/');
  });

  test('/ 와 /link/* carve-out 유지 (redirect 안 함)', () => {
    setPath('/');
    handleBubbledError(authErr);
    expect(window.location.href).toBe('');
    setPath('/link/abc');
    handleBubbledError(authErr);
    expect(window.location.href).toBe('');
  });

  test('non-401 은 영향 없음 (Dialog 분기 — redirect 안 함)', () => {
    (isAuthError as Mock).mockReturnValue(false);
    setPath('/parties');
    handleBubbledError({ isAxiosError: true, response: { status: 500 } });
    expect(window.location.href).toBe('');
    expect(dialogOpen).toHaveBeenCalledTimes(1);
  });

  test('서버측(window undefined)에선 redirect/Dialog 없이 early-return', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    expect(() => handleBubbledError(authErr)).not.toThrow();
    expect(dialogOpen).not.toHaveBeenCalled();
  });
});

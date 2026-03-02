import { renderHook, act } from '@testing-library/react';
import { useAppRouter } from './use-app-router.hook';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    refresh: mockRefresh,
    back: mockBack,
  }),
}));

jest.mock('./parse-href', () => ({
  parseHref: (href: string, options: any) => {
    if (options?.path) {
      let result = href as string;
      for (const [key, value] of Object.entries(options.path)) {
        result = result.replace(`[${key}]`, String(value));
      }
      return result;
    }
    if (options?.query) {
      const qs = new URLSearchParams(options.query).toString();
      return `${href}?${qs}`;
    }
    return href;
  },
}));

describe('useAppRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('push가 parseHref를 통해 변환된 경로로 호출된다', () => {
    const { result } = renderHook(() => useAppRouter());

    act(() => {
      result.current.push('/' as any);
    });

    expect(mockPush).toHaveBeenCalledWith('/', undefined);
  });

  test('replace가 동작한다', () => {
    const { result } = renderHook(() => useAppRouter());

    act(() => {
      result.current.replace('/' as any);
    });

    expect(mockReplace).toHaveBeenCalled();
  });

  test('refresh, back 등 원본 메서드가 전달된다', () => {
    const { result } = renderHook(() => useAppRouter());

    expect(result.current.refresh).toBe(mockRefresh);
    expect(result.current.back).toBe(mockBack);
  });
});

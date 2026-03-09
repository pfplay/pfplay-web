import { renderHook, act } from '@testing-library/react';
import { useChangeLanguage } from './use-change-language.hook';

const mockRefresh = vi.fn();
vi.mock('@/shared/lib/router/use-app-router.hook', () => ({
  useAppRouter: () => ({ refresh: mockRefresh }),
}));

const mockSetCookie = vi.fn();
vi.mock('cookies-next', () => ({
  setCookie: (...args: any[]) => mockSetCookie(...args),
}));

vi.mock('@/shared/lib/localization/constants', () => ({
  Language: { En: 'en', Ko: 'ko' },
  LANGUAGE_COOKIE_KEY: 'lang',
}));

describe('useChangeLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('언어 변경 시 쿠키가 설정되고 라우터가 새로고침된다', () => {
    const { result } = renderHook(() => useChangeLanguage());

    act(() => {
      result.current('ko' as any);
    });

    expect(mockSetCookie).toHaveBeenCalledWith('lang', 'ko');
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});

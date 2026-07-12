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

vi.mock('@/shared/config/time', () => ({
  TEN_YEARS: 10 * 365 * 24 * 60 * 60,
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

    expect(mockSetCookie).toHaveBeenCalledWith('lang', 'ko', expect.any(Object));
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  // #447: 명시적 선택은 브라우저를 껐다 켜도 유지되어야 한다. 옵션 없는 setCookie 는
  //       세션 쿠키가 되어 종료 시 삭제되고, 재방문 시 미들웨어가 Accept-Language 로
  //       되돌려 사용자의 선택이 유실된다 → 영구(maxAge) 쿠키로 저장한다.
  test('명시적 선택은 브라우저 재시작 후에도 유지되도록 maxAge 로 영구 저장한다', () => {
    const { result } = renderHook(() => useChangeLanguage());

    act(() => {
      result.current('ko' as any);
    });

    expect(mockSetCookie).toHaveBeenCalledWith(
      'lang',
      'ko',
      expect.objectContaining({ maxAge: 10 * 365 * 24 * 60 * 60, path: '/' })
    );
  });
});

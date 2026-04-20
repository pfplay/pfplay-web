vi.mock('@/shared/lib/router/use-app-router.hook');

import { renderHook } from '@testing-library/react';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useMobileGuard } from './mobile-guard.component';

const mockPush = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useAppRouter as Mock).mockReturnValue({ push: mockPush });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMobileGuard', () => {
  test('뷰포트 너비가 768px 미만이면 /mobile-notice로 이동한다', () => {
    vi.stubGlobal('innerWidth', 375);

    renderHook(() => useMobileGuard());

    expect(mockPush).toHaveBeenCalledWith('/mobile-notice');
  });

  test('뷰포트 너비가 768px 이상이면 이동하지 않는다', () => {
    vi.stubGlobal('innerWidth', 1024);

    renderHook(() => useMobileGuard());

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('뷰포트 너비가 정확히 768px이면 이동하지 않는다', () => {
    vi.stubGlobal('innerWidth', 768);

    renderHook(() => useMobileGuard());

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('현재 경로가 /mobile-notice이면 이동하지 않는다', () => {
    vi.stubGlobal('innerWidth', 375);
    vi.stubGlobal('location', { pathname: '/mobile-notice' });

    renderHook(() => useMobileGuard());

    expect(mockPush).not.toHaveBeenCalled();
  });
});

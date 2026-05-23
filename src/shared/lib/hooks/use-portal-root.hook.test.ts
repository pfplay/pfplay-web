import { renderHook } from '@testing-library/react';
import usePortalRoot from './use-portal-root.hook';

vi.mock('@/shared/lib/functions/log/logger', () => ({
  errorLog: vi.fn(),
}));

vi.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  default: () => (fn: any) => fn,
}));

describe('usePortalRoot', () => {
  test('요청한 id의 포털 루트 요소가 있으면 해당 요소를 반환한다', () => {
    const root = document.createElement('div');
    root.id = 'tooltip-root';
    document.body.appendChild(root);

    const { result } = renderHook(() => usePortalRoot('tooltip-root'));

    expect(result.current).toBe(root);

    document.body.removeChild(root);
  });

  test('요청한 id의 포털 루트 요소가 없으면 null을 반환한다', () => {
    const { result } = renderHook(() => usePortalRoot('nonexistent'));
    expect(result.current).toBeNull();
  });
});

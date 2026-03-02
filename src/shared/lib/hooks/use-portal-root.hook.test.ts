import { renderHook } from '@testing-library/react';
import usePortalRoot from './use-portal-root.hook';

jest.mock('@/shared/lib/functions/log/logger', () => ({
  errorLog: jest.fn(),
}));

jest.mock('@/shared/lib/functions/log/with-debugger', () => ({
  __esModule: true,
  default: () => (fn: any) => fn,
}));

describe('usePortalRoot', () => {
  test('DOM에 DrawerRoot 요소가 있으면 해당 요소를 반환한다', () => {
    const root = document.createElement('div');
    root.id = 'drawer-root';
    document.body.appendChild(root);

    const { result } = renderHook(() => usePortalRoot('drawer-root'));

    expect(result.current).toBe(root);

    document.body.removeChild(root);
  });

  test('DOM에 DrawerRoot 요소가 없으면 null을 반환한다', () => {
    const { result } = renderHook(() => usePortalRoot('nonexistent'));
    expect(result.current).toBeNull();
  });
});

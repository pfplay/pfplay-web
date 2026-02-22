import { renderHook } from '@testing-library/react';
import useDidMountEffect from './use-did-mount-effect';

describe('useDidMountEffect', () => {
  test('마운트 완료 후 effect 실행', () => {
    const effect = jest.fn();

    renderHook(() => useDidMountEffect(effect));

    expect(effect).toHaveBeenCalledTimes(1);
  });

  test('cleanup 함수 호출 확인', () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);

    const { unmount } = renderHook(() => useDidMountEffect(effect));

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test('effect가 한 번만 실행됨', () => {
    const effect = jest.fn();

    const { rerender } = renderHook(() => useDidMountEffect(effect));

    rerender();
    rerender();

    expect(effect).toHaveBeenCalledTimes(1);
  });
});

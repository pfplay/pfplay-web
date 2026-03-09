import { renderHook } from '@testing-library/react';
import useDidUpdateEffect from './use-did-update-effect';

describe('useDidUpdateEffect', () => {
  test('mount 시 effect 실행 안 됨', () => {
    const effect = vi.fn();

    renderHook(({ dep }) => useDidUpdateEffect(effect, [dep]), {
      initialProps: { dep: 1 },
    });

    expect(effect).not.toHaveBeenCalled();
  });

  test('dependency 변경 시 effect 실행', () => {
    const effect = vi.fn();

    const { rerender } = renderHook(({ dep }) => useDidUpdateEffect(effect, [dep]), {
      initialProps: { dep: 1 },
    });

    rerender({ dep: 2 });

    expect(effect).toHaveBeenCalledTimes(1);
  });

  test('dependency 미변경 시 effect 실행 안 됨', () => {
    const effect = vi.fn();

    const { rerender } = renderHook(({ dep }) => useDidUpdateEffect(effect, [dep]), {
      initialProps: { dep: 1 },
    });

    rerender({ dep: 1 });

    expect(effect).not.toHaveBeenCalled();
  });
});

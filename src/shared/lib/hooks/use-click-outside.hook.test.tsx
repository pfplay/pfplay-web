import { renderHook, act } from '@testing-library/react';
import useClickOutside from './use-click-outside.hook';

describe('useClickOutside', () => {
  test('ref 외부 클릭 → callback 호출', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    // ref에 DOM 요소 연결
    const inside = document.createElement('div');
    document.body.appendChild(inside);
    Object.defineProperty(result.current, 'current', {
      value: inside,
      writable: true,
    });

    // 외부 클릭
    const outside = document.createElement('div');
    document.body.appendChild(outside);

    act(() => {
      outside.click();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // 정리
    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  test('ref 내부 클릭 → callback 호출 안 함', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    const inside = document.createElement('div');
    document.body.appendChild(inside);
    Object.defineProperty(result.current, 'current', {
      value: inside,
      writable: true,
    });

    act(() => {
      inside.click();
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(inside);
  });

  test('언마운트 시 이벤트 리스너 정리됨', () => {
    const callback = vi.fn();
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { result, unmount } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    const inside = document.createElement('div');
    document.body.appendChild(inside);
    Object.defineProperty(result.current, 'current', {
      value: inside,
      writable: true,
    });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));

    removeSpy.mockRestore();
    document.body.removeChild(inside);
  });
});

import { renderHook, act } from '@testing-library/react';
import { useDisclosure } from './use-disclosure.hook';

describe('useDisclosure', () => {
  test('기본 상태: open=false', () => {
    const { result } = renderHook(() => useDisclosure());

    expect(result.current.open).toBe(false);
  });

  test('defaultOpen: true → 초기 open=true', () => {
    const { result } = renderHook(() => useDisclosure({ defaultOpen: true }));

    expect(result.current.open).toBe(true);
  });

  test('onOpen() 호출 → open=true', () => {
    const { result } = renderHook(() => useDisclosure());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.open).toBe(true);
  });

  test('onClose() 호출 → open=false', () => {
    const { result } = renderHook(() => useDisclosure({ defaultOpen: true }));

    act(() => {
      result.current.onClose();
    });

    expect(result.current.open).toBe(false);
  });

  test('onToggle() 호출 → 상태 반전', () => {
    const { result } = renderHook(() => useDisclosure());

    expect(result.current.open).toBe(false);

    act(() => {
      result.current.onToggle();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.onToggle();
    });
    expect(result.current.open).toBe(false);
  });

  test('제어 모드: open prop이 내부 상태를 오버라이드', () => {
    const { result } = renderHook(() => useDisclosure({ open: true }));

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.onClose();
    });

    // 제어 모드이므로 내부 상태 변경 없이 open prop 값 유지
    expect(result.current.open).toBe(true);
  });

  test('onOpen 콜백 함수 호출 확인', () => {
    const onOpenCallback = jest.fn();
    const { result } = renderHook(() => useDisclosure({ onOpen: onOpenCallback }));

    act(() => {
      result.current.onOpen();
    });

    expect(onOpenCallback).toHaveBeenCalledTimes(1);
  });

  test('onClose 콜백 함수 호출 확인', () => {
    const onCloseCallback = jest.fn();
    const { result } = renderHook(() =>
      useDisclosure({ defaultOpen: true, onClose: onCloseCallback })
    );

    act(() => {
      result.current.onClose();
    });

    expect(onCloseCallback).toHaveBeenCalledTimes(1);
  });
});

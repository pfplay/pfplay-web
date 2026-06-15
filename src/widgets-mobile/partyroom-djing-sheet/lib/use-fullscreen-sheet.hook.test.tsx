import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { FullscreenSheetProvider, useFullscreenSheet } from './use-fullscreen-sheet.hook';

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

describe('useFullscreenSheet', () => {
  let historySpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    historySpy = vi.spyOn(window.history, 'pushState');
  });
  afterEach(() => {
    historySpy.mockRestore();
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  test('초기 스택 비어있음', () => {
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    expect(result.current.stack).toHaveLength(0);
  });

  test('push 호출 시 스택 push + history.pushState 호출', () => {
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div /> });
    });
    expect(result.current.stack).toHaveLength(1);
    expect(result.current.stack[0].key).toBe('select-playlist');
    expect(historySpy).toHaveBeenCalledTimes(1);
  });

  test('같은 key 중복 push 는 dedup (스택 1개 유지)', () => {
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div /> });
      result.current.push({ key: 'select-playlist', node: <div /> });
    });
    expect(result.current.stack).toHaveLength(1);
  });

  test('pop 호출 시 onDismiss 콜백 실행 + 스택에서 제거', () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onDismiss });
    });
    act(() => {
      result.current.pop();
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('popstate 이벤트 시 스택 pop (1개일 때 close)', () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onDismiss });
    });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('popstate 이벤트 시 다중 스택은 pop 만 (상위만 제거)', () => {
    const onDismissA = vi.fn();
    const onDismissB = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onDismiss: onDismissA });
      result.current.push({ key: 'add-tracks', node: <div />, onDismiss: onDismissB });
    });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.stack).toHaveLength(1);
    expect(result.current.stack[0].key).toBe('select-playlist');
    expect(onDismissB).toHaveBeenCalledTimes(1);
    expect(onDismissA).not.toHaveBeenCalled();
  });

  test('ESC 키 입력 시 popstate 동일 동작 (history.back 호출)', () => {
    const backSpy = vi.spyOn(window.history, 'back');
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div /> });
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(backSpy).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });

  test('closeAll 호출 시 모든 onDismiss 콜백 + history.go(-N)', () => {
    const goSpy = vi.spyOn(window.history, 'go');
    const onDismissA = vi.fn();
    const onDismissB = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onDismiss: onDismissA });
      result.current.push({ key: 'add-tracks', node: <div />, onDismiss: onDismissB });
    });
    act(() => {
      result.current.closeAll();
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onDismissA).toHaveBeenCalledTimes(1);
    expect(onDismissB).toHaveBeenCalledTimes(1);
    expect(goSpy).toHaveBeenCalledWith(-2);
    goSpy.mockRestore();
  });

  test('pop() 는 onDismiss 발화(user-driven), pop({ programmatic: true }) 는 미발화', () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    // 1) programmatic close — 소비자가 자체 결과를 처리한 뒤 제거 → dismiss 콜백 미발화
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onDismiss });
    });
    act(() => {
      result.current.pop({ programmatic: true });
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onDismiss).not.toHaveBeenCalled();
    // 2) user-driven close(뒤로가기/×/Esc 경유 pop) → dismiss 콜백 발화
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onDismiss });
    });
    act(() => {
      result.current.pop();
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('unmount 시 popstate/keydown listener cleanup', () => {
    const { unmount } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});

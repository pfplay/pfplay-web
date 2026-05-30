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

  test('pop 호출 시 onClose 콜백 실행 + 스택에서 제거', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onClose });
    });
    act(() => {
      result.current.pop();
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('popstate 이벤트 시 스택 pop (1개일 때 close)', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onClose });
    });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('popstate 이벤트 시 다중 스택은 pop 만 (상위만 제거)', () => {
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onClose: onCloseA });
      result.current.push({ key: 'add-tracks', node: <div />, onClose: onCloseB });
    });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.stack).toHaveLength(1);
    expect(result.current.stack[0].key).toBe('select-playlist');
    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(onCloseA).not.toHaveBeenCalled();
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

  test('closeAll 호출 시 모든 onClose 콜백 + history.go(-N)', () => {
    const goSpy = vi.spyOn(window.history, 'go');
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    const { result } = renderHook(() => useFullscreenSheet(), { wrapper: wrap });
    act(() => {
      result.current.push({ key: 'select-playlist', node: <div />, onClose: onCloseA });
      result.current.push({ key: 'add-tracks', node: <div />, onClose: onCloseB });
    });
    act(() => {
      result.current.closeAll();
    });
    expect(result.current.stack).toHaveLength(0);
    expect(onCloseA).toHaveBeenCalledTimes(1);
    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(goSpy).toHaveBeenCalledWith(-2);
    goSpy.mockRestore();
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

import { ChangeEvent } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce.hook';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('value는 handleChange 호출 즉시 업데이트', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback));

    act(() => {
      result.current.handleChange({
        target: { value: 'test' },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe('test');
  });

  test('callback은 기본 interval(500ms) 후 호출', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback));

    act(() => {
      result.current.handleChange({
        target: { value: 'hello' },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('hello');
  });

  test('연속 입력 시 이전 타이머 취소, 마지막 값만 콜백', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback));

    act(() => {
      result.current.handleChange({
        target: { value: 'h' },
      } as ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current.handleChange({
        target: { value: 'he' },
      } as ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current.handleChange({
        target: { value: 'hel' },
      } as ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('hel');
  });

  test('커스텀 interval 적용', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, { interval: 1000 }));

    act(() => {
      result.current.handleChange({
        target: { value: 'test' },
      } as ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('test');
  });

  test('callback이 undefined여도 에러 없음', () => {
    const { result } = renderHook(() => useDebounce(undefined));

    act(() => {
      result.current.handleChange({
        target: { value: 'test' },
      } as ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.value).toBe('test');
  });
});

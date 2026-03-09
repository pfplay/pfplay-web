import { renderHook } from '@testing-library/react';
import errorEmitter from './error-emitter';
import useOnError from './use-on-error.hook';

describe('useOnError', () => {
  test('마운트 시 errorEmitter에 리스너를 등록한다', () => {
    const onSpy = vi.spyOn(errorEmitter, 'on');
    const callback = vi.fn();

    renderHook(() => useOnError('JWT-003' as any, callback));

    expect(onSpy).toHaveBeenCalledWith('JWT-003', callback);
    onSpy.mockRestore();
  });

  test('에러 코드 발행 시 콜백이 호출된다', () => {
    const callback = vi.fn();
    renderHook(() => useOnError('JWT-001' as any, callback));

    errorEmitter.emit('JWT-001' as any);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('언마운트 시 리스너가 해제된다', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useOnError('JWT-002' as any, callback));

    unmount();
    errorEmitter.emit('JWT-002' as any);

    expect(callback).not.toHaveBeenCalled();
  });
});

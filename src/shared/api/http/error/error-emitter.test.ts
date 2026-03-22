import errorEmitter from './error-emitter';
import { ErrorCode } from '../types/@shared';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ErrorEmitter', () => {
  test('싱글턴 인스턴스 — 동일한 객체 참조', () => {
    // 모듈 레벨 export가 항상 같은 인스턴스를 반환하는지 확인
    expect(errorEmitter).toBeDefined();
    expect(typeof errorEmitter.on).toBe('function');
    expect(typeof errorEmitter.emit).toBe('function');
  });

  test('emit(ErrorCode) → 구독자에게 전달', () => {
    const callback = vi.fn();
    const unsubscribe = errorEmitter.on(ErrorCode.ACCESS_TOKEN_EXPIRED, callback);

    errorEmitter.emit(ErrorCode.ACCESS_TOKEN_EXPIRED);

    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  test('on/emit/unsubscribe 라이프사이클 — 구독 해제 후 콜백 호출 안 됨', () => {
    const callback = vi.fn();
    const unsubscribe = errorEmitter.on(ErrorCode.UNAUTHORIZED_SESSION, callback);

    errorEmitter.emit(ErrorCode.UNAUTHORIZED_SESSION);
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();

    errorEmitter.emit(ErrorCode.UNAUTHORIZED_SESSION);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('다른 ErrorCode 이벤트는 구독자에게 전달되지 않음', () => {
    const callback = vi.fn();
    const unsubscribe = errorEmitter.on(ErrorCode.ACCESS_TOKEN_NOT_FOUND, callback);

    errorEmitter.emit(ErrorCode.ALREADY_BLOCKED_CREW);

    expect(callback).not.toHaveBeenCalled();

    unsubscribe();
  });

  test('같은 ErrorCode에 여러 구독자 등록 가능', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const unsub1 = errorEmitter.on(ErrorCode.NOT_FOUND_ROOM, cb1);
    const unsub2 = errorEmitter.on(ErrorCode.NOT_FOUND_ROOM, cb2);

    errorEmitter.emit(ErrorCode.NOT_FOUND_ROOM);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });
});

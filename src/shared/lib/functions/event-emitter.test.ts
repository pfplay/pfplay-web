import { EventEmitter } from './event-emitter';

describe('EventEmitter', () => {
  test('on으로 등록한 콜백이 emit 시 호출됨', () => {
    const emitter = new EventEmitter();
    const callback = jest.fn();

    emitter.on('test', callback);
    emitter.emit('test');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('같은 이벤트에 여러 콜백 등록 가능', () => {
    const emitter = new EventEmitter();
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    emitter.on('test', cb1);
    emitter.on('test', cb2);
    emitter.emit('test');

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  test('다른 이벤트의 콜백은 호출되지 않음', () => {
    const emitter = new EventEmitter();
    const callback = jest.fn();

    emitter.on('other', callback);
    emitter.emit('test');

    expect(callback).not.toHaveBeenCalled();
  });

  test('on 반환값으로 구독 해제 가능', () => {
    const emitter = new EventEmitter();
    const callback = jest.fn();

    const unsubscribe = emitter.on('test', callback);
    unsubscribe();
    emitter.emit('test');

    expect(callback).not.toHaveBeenCalled();
  });

  test('구독 해제 후에도 다른 콜백은 정상 동작', () => {
    const emitter = new EventEmitter();
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    const unsub1 = emitter.on('test', cb1);
    emitter.on('test', cb2);
    unsub1();
    emitter.emit('test');

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  test('등록되지 않은 이벤트를 emit해도 에러 없음', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.emit('nonexistent')).not.toThrow();
  });

  test('제네릭 타입 이벤트 지원', () => {
    const emitter = new EventEmitter<'play' | 'pause'>();
    const callback = jest.fn();

    emitter.on('play', callback);
    emitter.emit('play');

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

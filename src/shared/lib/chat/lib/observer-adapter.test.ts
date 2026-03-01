import ObserverAdapter from './observer-adapter';
import Observer from '../../functions/observer';
import type { ChatObserverEvent } from '../model/chat-message-listener.model';

describe('ObserverAdapter', () => {
  let adapter: ObserverAdapter<string>;

  beforeEach(() => {
    adapter = new ObserverAdapter(new Observer<ChatObserverEvent<string>>());
  });

  test('register + notify → 리스너가 event.message만 수신한다', () => {
    const listener = jest.fn();
    adapter.register(listener);

    adapter.notify({ type: 'add', message: 'hello' });

    expect(listener).toHaveBeenCalledWith('hello');
  });

  test('복수 리스너 등록 → 모두 호출된다', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    adapter.register(listener1);
    adapter.register(listener2);

    adapter.notify({ type: 'add', message: 'test' });

    expect(listener1).toHaveBeenCalledWith('test');
    expect(listener2).toHaveBeenCalledWith('test');
  });

  test('deregisterAll → 이후 notify 시 리스너가 호출되지 않는다', () => {
    const listener = jest.fn();
    adapter.register(listener);
    adapter.deregisterAll();

    adapter.notify({ type: 'add', message: 'hello' });

    expect(listener).not.toHaveBeenCalled();
  });

  test('deregister → 참조 불일치로 리스너가 제거되지 않는다 (known limitation)', () => {
    const listener = jest.fn();
    adapter.register(listener);
    adapter.deregister(listener);

    // deregister는 새로운 래퍼 함수를 생성하므로 원래 래퍼와 참조가 다르다.
    // 따라서 리스너가 제거되지 않고 여전히 호출된다.
    adapter.notify({ type: 'update', message: 'still here' });

    expect(listener).toHaveBeenCalledWith('still here');
  });
});

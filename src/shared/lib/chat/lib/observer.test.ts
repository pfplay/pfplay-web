import Observer from './observer';

describe('Observer', () => {
  test('구독자에게 올바른 데이터 전달', () => {
    const observer = new Observer<number>();
    const mockListener = jest.fn();

    observer.subscribe(mockListener);
    observer.notify(42);

    expect(mockListener).toHaveBeenCalledWith(42);
  });

  test('여러 구독자에게 알림 전송', () => {
    const observer = new Observer<string>();
    const mockListener1 = jest.fn();
    const mockListener2 = jest.fn();

    observer.subscribe(mockListener1);
    observer.subscribe(mockListener2);
    observer.notify('hello');

    expect(mockListener1).toHaveBeenCalledWith('hello');
    expect(mockListener2).toHaveBeenCalledWith('hello');
  });

  test('구독 해제된 리스너는 호출되지 않아야 한다', () => {
    const observer = new Observer<number>();
    const mockListener = jest.fn();

    observer.subscribe(mockListener);
    observer.unsubscribe(mockListener);
    observer.notify(42);

    expect(mockListener).not.toHaveBeenCalled();
  });

  test('구독된 리스너만 호출되어야 한다', () => {
    const observer = new Observer<number>();
    const mockListener1 = jest.fn();
    const mockListener2 = jest.fn();

    observer.subscribe(mockListener1);
    observer.notify(1);
    observer.unsubscribe(mockListener1);
    observer.subscribe(mockListener2);
    observer.notify(2);

    expect(mockListener1).toHaveBeenCalledWith(1);
    expect(mockListener2).toHaveBeenCalledWith(2);
    expect(mockListener1).not.toHaveBeenCalledWith(2);
    expect(mockListener2).not.toHaveBeenCalledWith(1);
  });
});

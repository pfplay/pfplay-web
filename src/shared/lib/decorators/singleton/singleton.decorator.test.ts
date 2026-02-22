import Singleton from './singleton.decorator';

describe('Singleton decorator', () => {
  test('여러 번 인스턴스화해도 동일 인스턴스 반환', () => {
    @Singleton
    class TestService {
      public value = 0;
    }

    const a = new TestService();
    const b = new TestService();

    expect(a).toBe(b);
  });

  test('첫 번째 인스턴스의 상태가 유지됨', () => {
    @Singleton
    class Counter {
      public count = 0;
      public increment() {
        this.count++;
      }
    }

    const first = new Counter();
    first.increment();
    first.increment();

    const second = new Counter();
    expect(second.count).toBe(2);
  });

  test('프로토타입 체인이 유지됨', () => {
    @Singleton
    class MyClass {
      public greet() {
        return 'hello';
      }
    }

    const instance = new MyClass();
    expect(instance.greet()).toBe('hello');
    expect(instance).toBeInstanceOf(MyClass);
  });
});

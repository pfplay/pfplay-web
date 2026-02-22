import MockResolve from './mock-resolve.decorator';

describe('MockResolve decorator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.useFakeTimers();
    process.env = { ...originalEnv, NODE_ENV: 'test', NEXT_PUBLIC_USE_MOCK: 'true' };
  });

  afterEach(() => {
    jest.useRealTimers();
    process.env = originalEnv;
  });

  test('mock 환경에서 data resolve', async () => {
    class TestService {
      @MockResolve({ data: { id: 1 } })
      public async fetchData() {
        return { id: 999 };
      }
    }

    const service = new TestService();
    const promise = service.fetchData();
    jest.runAllTimers();
    await expect(promise).resolves.toEqual({ id: 1 });
  });

  test('mock 환경에서 error reject', async () => {
    class TestService {
      @MockResolve({ error: new Error('mock error') })
      public async fetchData() {
        return 'real';
      }
    }

    const service = new TestService();
    const promise = service.fetchData();
    jest.runAllTimers();
    await expect(promise).rejects.toThrow('mock error');
  });

  test('delay 옵션 적용', async () => {
    class TestService {
      @MockResolve({ data: 'delayed' }, { delay: 500 })
      public async fetchData() {
        return 'real';
      }
    }

    const service = new TestService();
    const callback = jest.fn();
    service.fetchData().then(callback);

    jest.advanceTimersByTime(499);
    await Promise.resolve();
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(callback).toHaveBeenCalledWith('delayed');
  });

  test('production 환경에서는 원래 메서드 실행', async () => {
    process.env.NODE_ENV = 'production';

    class TestService {
      @MockResolve({ data: 'mock' })
      public async fetchData() {
        return 'real';
      }
    }

    const service = new TestService();
    await expect(service.fetchData()).resolves.toBe('real');
  });
});

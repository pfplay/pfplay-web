import MockReturn from './mock-return.decorator';

describe('MockReturn decorator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'test', NEXT_PUBLIC_USE_MOCK: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('mock 환경에서 data 반환', () => {
    class TestService {
      @MockReturn({ data: { id: 1, name: 'mock' } })
      public getData() {
        return { id: 999, name: 'real' };
      }
    }

    const service = new TestService();
    expect(service.getData()).toEqual({ id: 1, name: 'mock' });
  });

  test('mock 환경에서 error throw', () => {
    class TestService {
      @MockReturn({ error: new Error('mock error') })
      public getData() {
        return 'real';
      }
    }

    const service = new TestService();
    expect(() => service.getData()).toThrow('mock error');
  });

  test('production 환경에서는 원래 메서드 실행', () => {
    process.env.NODE_ENV = 'production';

    class TestService {
      @MockReturn({ data: 'mock' })
      public getData() {
        return 'real';
      }
    }

    const service = new TestService();
    expect(service.getData()).toBe('real');
  });

  test('NEXT_PUBLIC_USE_MOCK이 false면 원래 메서드 실행', () => {
    process.env.NEXT_PUBLIC_USE_MOCK = 'false';

    class TestService {
      @MockReturn({ data: 'mock' })
      public getData() {
        return 'real';
      }
    }

    const service = new TestService();
    expect(service.getData()).toBe('real');
  });
});

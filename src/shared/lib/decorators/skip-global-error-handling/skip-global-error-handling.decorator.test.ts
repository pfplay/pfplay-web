import SkipGlobalErrorHandling, {
  shouldSkipGlobalErrorHandling,
} from './skip-global-error-handling.decorator';

describe('SkipGlobalErrorHandling decorator', () => {
  test('에러 발생 시 skipGlobalErrorHandling 프로퍼티 추가', async () => {
    class TestService {
      @SkipGlobalErrorHandling()
      public async failingMethod() {
        throw new Error('test error');
      }
    }

    const service = new TestService();
    try {
      await service.failingMethod();
    } catch (error) {
      expect(shouldSkipGlobalErrorHandling(error)).toBe(true);
    }
  });

  test('when: false이면 프로퍼티 추가 안 됨', async () => {
    class TestService {
      @SkipGlobalErrorHandling({ when: false })
      public async failingMethod() {
        throw new Error('test error');
      }
    }

    const service = new TestService();
    try {
      await service.failingMethod();
    } catch (error) {
      expect(shouldSkipGlobalErrorHandling(error)).toBe(false);
    }
  });

  test('when 함수가 조건부로 프로퍼티 추가', async () => {
    class TestService {
      @SkipGlobalErrorHandling<Error>({ when: (err) => err.message === 'skip me' })
      public async failingMethod(msg: string) {
        throw new Error(msg);
      }
    }

    const service = new TestService();

    try {
      await service.failingMethod('skip me');
    } catch (error) {
      expect(shouldSkipGlobalErrorHandling(error)).toBe(true);
    }

    try {
      await service.failingMethod('do not skip');
    } catch (error) {
      expect(shouldSkipGlobalErrorHandling(error)).toBe(false);
    }
  });

  test('성공 시 원래 반환값 유지', async () => {
    class TestService {
      @SkipGlobalErrorHandling()
      public async successMethod() {
        return 'ok';
      }
    }

    const service = new TestService();
    await expect(service.successMethod()).resolves.toBe('ok');
  });
});

describe('shouldSkipGlobalErrorHandling', () => {
  test('일반 Error는 false', () => {
    expect(shouldSkipGlobalErrorHandling(new Error('normal'))).toBe(false);
  });

  test('null/undefined는 false', () => {
    expect(shouldSkipGlobalErrorHandling(null)).toBe(false);
    expect(shouldSkipGlobalErrorHandling(undefined)).toBe(false);
  });

  test('문자열은 false', () => {
    expect(shouldSkipGlobalErrorHandling('error string')).toBe(false);
  });
});

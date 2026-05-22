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

  test('when predicate 가 throw 해도 원본 에러를 보존하고 skip 안 함 (fail-safe)', async () => {
    const buggyPredicate = () => {
      throw new Error('predicate bug');
    };

    class TestService {
      @SkipGlobalErrorHandling<Error>({ when: buggyPredicate })
      public async failingMethod() {
        throw new Error('original error');
      }
    }

    const service = new TestService();
    try {
      await service.failingMethod();
      throw new Error('should have thrown');
    } catch (error) {
      // 원본 에러가 predicate 의 throw 로 가려지지 않음
      expect((error as Error).message).toBe('original error');
      // fail-safe: predicate 실패 시 skip 플래그 부착 안 함 → 전역 핸들러 정상 도달
      expect(shouldSkipGlobalErrorHandling(error)).toBe(false);
    }
  });

  test('when predicate 가 SSR-unsafe 글로벌(location 등)을 참조해도 fail-safe', async () => {
    // SSR 컨텍스트에서 `location` 미정의 시 ReferenceError 던지는 predicate 시뮬레이션.
    // 동일 가족(브라우저 전용 글로벌 무가드 참조)이 SSR 에서 throw → fail-safe 로 흡수.
    const ssrUnsafePredicate = () => {
      throw new ReferenceError('location is not defined');
    };

    class TestService {
      @SkipGlobalErrorHandling<Error>({ when: ssrUnsafePredicate })
      public async failingMethod() {
        throw new Error('underlying API error');
      }
    }

    const service = new TestService();
    try {
      await service.failingMethod();
      throw new Error('should have thrown');
    } catch (error) {
      expect((error as Error).message).toBe('underlying API error');
      expect((error as Error).name).not.toBe('ReferenceError');
      expect(shouldSkipGlobalErrorHandling(error)).toBe(false);
    }
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

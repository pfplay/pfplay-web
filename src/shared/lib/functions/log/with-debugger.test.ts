import withDebugger from './with-debugger';

describe('withDebugger', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('프로덕션 런타임 (NEXT_PUBLIC_VERCEL_ENV=production)', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    });

    describe('window.debugLevel 가 기준보다 클 때 (긴급 escape hatch)', () => {
      test('함수를 호출한다', () => {
        // Arrange
        const debugLevel = 0;
        const fn = vi.fn();
        const args = [1, 2, 3];
        window.debugLevel = debugLevel + 1;

        // Act
        withDebugger(debugLevel)(fn)(...args);

        // Assert
        expect(fn).toHaveBeenCalledWith(...args);
      });

      test('함수의 반환값을 돌려준다', () => {
        // Arrange
        const debugLevel = 0;
        const fn = vi.fn().mockReturnValue('result');
        const args = [1, 2, 3];
        window.debugLevel = debugLevel + 1;

        // Act
        const result = withDebugger(debugLevel)(fn)(...args);

        // Assert
        expect(result).toBe('result');
      });
    });

    describe('window.debugLevel 가 기준과 같을 때', () => {
      test('함수를 호출하지 않는다', () => {
        // Arrange
        const debugLevel = 1;
        const fn = vi.fn();
        const args = [1, 2, 3];
        window.debugLevel = debugLevel;

        // Act
        withDebugger(debugLevel)(fn)(...args);

        // Assert
        expect(fn).not.toHaveBeenCalledWith(...args);
      });

      test('fallback 값을 반환한다', () => {
        // Arrange
        const debugLevel = 1;
        const fn = vi.fn();
        const args = [1, 2, 3];
        const fallback = 'fallback';
        window.debugLevel = debugLevel;

        // Act
        const result = withDebugger(debugLevel)(fn, fallback)(...args);

        // Assert
        expect(result).toBe(fallback);
      });
    });

    describe('window.debugLevel 가 기준보다 작을 때', () => {
      test('함수를 호출하지 않는다', () => {
        // Arrange
        const debugLevel = 2;
        const fn = vi.fn();
        const args = [1, 2, 3];
        window.debugLevel = debugLevel - 1;

        // Act
        withDebugger(debugLevel)(fn)(...args);

        // Assert
        expect(fn).not.toHaveBeenCalledWith(...args);
      });
    });
  });

  describe('Vercel preview = 스테이징 (NEXT_PUBLIC_VERCEL_ENV=preview)', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    });

    test('debugLevel 를 상향하지 않아도 함수를 호출한다 (스테이징은 진단 로그 노출)', () => {
      // Arrange
      const debugLevel = 0;
      const fn = vi.fn();
      const args = [1, 2, 3];
      window.debugLevel = debugLevel; // 미상향

      // Act
      withDebugger(debugLevel)(fn)(...args);

      // Assert
      expect(fn).toHaveBeenCalledWith(...args);
    });
  });

  describe('비프로덕션 (NEXT_PUBLIC_VERCEL_ENV 미설정 — 로컬/테스트)', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', '');
    });

    test('함수를 호출한다', () => {
      // Arrange
      const debugLevel = 0;
      const fn = vi.fn();
      const args = [1, 2, 3];
      window.debugLevel = debugLevel;

      // Act
      withDebugger(debugLevel)(fn)(...args);

      // Assert
      expect(fn).toHaveBeenCalledWith(...args);
    });
  });
});

import { isProdRuntime, shouldEmitDiagnosticLog } from './log-environment';

describe('log-environment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    window.debugLevel = 0;
  });

  describe('isProdRuntime', () => {
    test("NEXT_PUBLIC_VERCEL_ENV='production' 이면 true", () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
      expect(isProdRuntime()).toBe(true);
    });

    test("NEXT_PUBLIC_VERCEL_ENV='preview'(스테이징) 이면 false", () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
      expect(isProdRuntime()).toBe(false);
    });

    test('미설정(로컬/테스트)이면 false', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', '');
      expect(isProdRuntime()).toBe(false);
    });
  });

  describe('shouldEmitDiagnosticLog', () => {
    test('preview(스테이징)에선 debugLevel 미상향이어도 true', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
      window.debugLevel = 0;
      expect(shouldEmitDiagnosticLog(0)).toBe(true);
    });

    test('로컬(미설정)에선 true', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', '');
      expect(shouldEmitDiagnosticLog(0)).toBe(true);
    });

    test('production + window.debugLevel 미상향이면 false (기본 침묵)', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
      window.debugLevel = 0;
      expect(shouldEmitDiagnosticLog(0)).toBe(false);
      expect(shouldEmitDiagnosticLog()).toBe(false);
    });

    test('production + window.debugLevel 상향이면 true (긴급 escape hatch)', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
      window.debugLevel = 1;
      expect(shouldEmitDiagnosticLog(0)).toBe(true);
    });
  });
});

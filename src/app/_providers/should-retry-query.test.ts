import { shouldRetryQuery } from './should-retry-query';

const authError = { isAxiosError: true, response: { status: 401 } };
const forbiddenError = { isAxiosError: true, response: { status: 403 } };
const serverError = { isAxiosError: true, response: { status: 500 } };
const networkError = { isAxiosError: true, message: 'Network Error' };

describe('shouldRetryQuery (web#303 / #312 — 일시 401 bounded retry)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('development 환경이면 무조건 false (어떤 에러든)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(shouldRetryQuery(1, authError)).toBe(false);
    expect(shouldRetryQuery(1, serverError)).toBe(false);
  });

  test('403(forbidden)은 즉시 중단 — 재시도 무의미', () => {
    expect(shouldRetryQuery(1, forbiddenError)).toBe(false);
    expect(shouldRetryQuery(3, forbiddenError)).toBe(false);
  });

  describe('401(auth) — 일시 401 자가회복용 bounded 재시도', () => {
    test('failureCount 1·2 는 재시도(true)', () => {
      expect(shouldRetryQuery(1, authError)).toBe(true);
      expect(shouldRetryQuery(2, authError)).toBe(true);
    });

    test('failureCount 3 부터는 확정(false) → 그때 리다이렉트', () => {
      expect(shouldRetryQuery(3, authError)).toBe(false);
      expect(shouldRetryQuery(4, authError)).toBe(false);
    });

    test('error.status(직접)로도 401 인식', () => {
      expect(shouldRetryQuery(1, { isAxiosError: true, status: 401 })).toBe(true);
    });
  });

  describe('기타 에러(5xx/네트워크) — 기존 정책 보존', () => {
    test('failureCount <= 3 재시도', () => {
      expect(shouldRetryQuery(1, serverError)).toBe(true);
      expect(shouldRetryQuery(3, networkError)).toBe(true);
    });

    test('failureCount 4 부터 중단', () => {
      expect(shouldRetryQuery(4, serverError)).toBe(false);
    });
  });
});

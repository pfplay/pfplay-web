import isAuthError from '@/shared/api/http/error/is-auth-error';
import isForbiddenError from '@/shared/api/http/error/is-forbidden-error';

/**
 * 전역 쿼리 retry 정책 (web#303 / #312).
 *
 * 401(`isAuthError`)을 즉시 no-retry 로 확정하면, cold-start·세션 워밍·레이스
 * 로 인한 **일시 401** 도 곧장 에러 확정 → `handleBubbledError` 및
 * `ProtectedLayout` 의 `location.href='/'` 가 발화해 사용자를 홈으로 추방한다
 * (#303 의 `navigated to "/"`). 일시 401 과 확정 미인증 401 은 응답만으로
 * 구분 불가하므로, **bounded 재시도**로 일시 401 을 자가회복시키고 — 재시도
 * 후에도 401 이면 그때 확정시켜 정상적으로 리다이렉트한다.
 *
 * - 403(`isForbiddenError`)은 권한 문제로 재시도 무의미 → 즉시 중단(기존 동작).
 * - mutation 에는 적용되지 않음(queries 기본 옵션).
 *
 * 순수 함수로 분리(provider 의 React/next 의존과 디커플) — 단위 테스트 용이.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (process.env.NODE_ENV === 'development') return false;
  if (isForbiddenError(error)) return false;
  if (isAuthError(error)) return failureCount <= 2; // 최대 2회 재시도 후 확정
  return failureCount <= 3;
}

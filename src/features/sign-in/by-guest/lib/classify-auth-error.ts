import isAuthError from '@/shared/api/http/error/is-auth-error';

export type AuthErrorClass = 'IGNORE' | 'VISITOR' | 'EXPIRED_MEMBER';

interface Input {
  error: unknown;
  partyroomId: number | null;
  hadMemberSession: boolean;
}

/**
 * 파티룸 컨텍스트의 401을 분류한다. (#428)
 * - IGNORE: 비401 또는 파티룸 컨텍스트 아님.
 * - EXPIRED_MEMBER: 비게스트 세션 이력 있음 → 재로그인 유도(reauthenticate).
 * - VISITOR: 이력 없음 → 기존 게스트 자동 로그인(링크-도메인 직접 진입 포함).
 */
export function classifyAuthError({ error, partyroomId, hadMemberSession }: Input): AuthErrorClass {
  if (!error || !isAuthError(error) || !partyroomId) return 'IGNORE';
  return hadMemberSession ? 'EXPIRED_MEMBER' : 'VISITOR';
}

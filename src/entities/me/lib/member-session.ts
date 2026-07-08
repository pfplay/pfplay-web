import { AuthorityTier } from '@/shared/api/http/types/@enums';

const KEY = 'pf_had_member_session';

/**
 * "이 기기에서 비게스트(FM/AM)로 인증된 적이 있는가"를 기록한다.
 * 방 안 토큰 만료(401) 시 만료-회원 vs 진짜 방문자(링크-도메인 직접 진입 포함)를
 * 구별하는 단서. localStorage라 새로고침/하드 리로드에도 생존한다. (#428, platform#306)
 */
export function markMemberSession(authorityTier: AuthorityTier): void {
  if (typeof window === 'undefined') return;
  if (authorityTier === AuthorityTier.FM || authorityTier === AuthorityTier.AM) {
    window.localStorage.setItem(KEY, '1');
  }
}

export function hadMemberSession(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(KEY) === '1';
}

export function clearMemberSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

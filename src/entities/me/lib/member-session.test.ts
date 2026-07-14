import { AuthorityTier } from '@/shared/api/http/types/@enums';
import { markMemberSession, hadMemberSession, clearMemberSession } from './member-session';

beforeEach(() => localStorage.clear());

describe('member-session', () => {
  test('비게스트(FM) me → 플래그 세팅', () => {
    markMemberSession(AuthorityTier.FM);
    expect(hadMemberSession()).toBe(true);
  });
  test('비게스트(AM) me → 플래그 세팅', () => {
    markMemberSession(AuthorityTier.AM);
    expect(hadMemberSession()).toBe(true);
  });
  test('게스트(GT) me → 세팅 안 함', () => {
    markMemberSession(AuthorityTier.GT);
    expect(hadMemberSession()).toBe(false);
  });
  test('clear → 제거', () => {
    markMemberSession(AuthorityTier.FM);
    clearMemberSession();
    expect(hadMemberSession()).toBe(false);
  });
  test('기본값 false', () => {
    expect(hadMemberSession()).toBe(false);
  });
});

import { AxiosError } from 'axios';
import { classifyAuthError } from './classify-auth-error';

const err401 = new AxiosError('e', undefined, undefined, undefined, { status: 401 } as never);
const err500 = new AxiosError('e', undefined, undefined, undefined, { status: 500 } as never);

describe('classifyAuthError', () => {
  test('401 + 플래그 있음 → EXPIRED_MEMBER', () => {
    expect(classifyAuthError({ error: err401, partyroomId: 5, hadMemberSession: true })).toBe(
      'EXPIRED_MEMBER'
    );
  });
  test('401 + 플래그 없음 → VISITOR', () => {
    expect(classifyAuthError({ error: err401, partyroomId: 5, hadMemberSession: false })).toBe(
      'VISITOR'
    );
  });
  test('비401 → IGNORE', () => {
    expect(classifyAuthError({ error: err500, partyroomId: 5, hadMemberSession: true })).toBe(
      'IGNORE'
    );
  });
  test('partyroomId 없음 → IGNORE', () => {
    expect(classifyAuthError({ error: err401, partyroomId: null, hadMemberSession: true })).toBe(
      'IGNORE'
    );
  });
  test('error 없음 → IGNORE', () => {
    expect(classifyAuthError({ error: null, partyroomId: 5, hadMemberSession: true })).toBe(
      'IGNORE'
    );
  });
});

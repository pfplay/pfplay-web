const mockRefetch = vi.fn().mockResolvedValue(undefined);
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ refetchQueries: mockRefetch }),
}));

const mockSignInGuest = vi.fn().mockResolvedValue(undefined);
vi.mock('@/shared/api/http/services', () => ({
  usersService: { signInGuest: () => mockSignInGuest() },
}));

const mockReauth = vi.fn();
vi.mock('./reauthenticate', () => ({ reauthenticate: (p: string) => mockReauth(p) }));

let mockHadMember = false;
vi.mock('@/entities/me/lib/member-session', () => ({
  hadMemberSession: () => mockHadMember,
}));

vi.mock('@/shared/lib/analytics/auth-tracking', () => ({ trackSignedIn: vi.fn() }));

import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import useAutoSignIn from './use-auto-sign-in.hook';

const err401 = new AxiosError('e', undefined, undefined, undefined, { status: 401 } as never);

beforeEach(() => {
  vi.clearAllMocks();
  mockHadMember = false;
});

describe('useAutoSignIn (만료-회원 라우팅)', () => {
  test('만료-회원(플래그 O) 401 → reauthenticate, signInGuest 미호출', async () => {
    mockHadMember = true;
    renderHook(() => useAutoSignIn(err401, 5));
    await waitFor(() => expect(mockReauth).toHaveBeenCalled());
    expect(mockSignInGuest).not.toHaveBeenCalled();
  });

  test('방문자(플래그 X) 401 → signInGuest, reauthenticate 미호출', async () => {
    mockHadMember = false;
    renderHook(() => useAutoSignIn(err401, 5));
    await waitFor(() => expect(mockSignInGuest).toHaveBeenCalled());
    expect(mockReauth).not.toHaveBeenCalled();
  });

  test('멱등성 — 재렌더해도 reauthenticate 1회', async () => {
    mockHadMember = true;
    const { rerender } = renderHook(() => useAutoSignIn(err401, 5));
    rerender();
    rerender();
    await waitFor(() => expect(mockReauth).toHaveBeenCalledTimes(1));
  });

  test('비파티룸(partyroomId null) → 아무 것도 안 함', () => {
    mockHadMember = true;
    renderHook(() => useAutoSignIn(err401, null));
    expect(mockReauth).not.toHaveBeenCalled();
    expect(mockSignInGuest).not.toHaveBeenCalled();
  });
});

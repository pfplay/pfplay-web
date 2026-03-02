const mockFetchMeAsync = jest.fn();
jest.mock('@/entities/me', () => ({
  useFetchMeAsync: () => mockFetchMeAsync,
}));

import { renderHook } from '@testing-library/react';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import useIsGuest from './use-is-guest.hook';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useIsGuest', () => {
  test('AuthorityTier가 GT이면 true를 반환한다', async () => {
    mockFetchMeAsync.mockResolvedValue({ authorityTier: AuthorityTier.GT });

    const { result } = renderHook(() => useIsGuest());
    const isGuest = await result.current();

    expect(isGuest).toBe(true);
  });

  test('AuthorityTier가 FM이면 false를 반환한다', async () => {
    mockFetchMeAsync.mockResolvedValue({ authorityTier: AuthorityTier.FM });

    const { result } = renderHook(() => useIsGuest());
    const isGuest = await result.current();

    expect(isGuest).toBe(false);
  });

  test('AuthorityTier가 AM이면 false를 반환한다', async () => {
    mockFetchMeAsync.mockResolvedValue({ authorityTier: AuthorityTier.AM });

    const { result } = renderHook(() => useIsGuest());
    const isGuest = await result.current();

    expect(isGuest).toBe(false);
  });
});

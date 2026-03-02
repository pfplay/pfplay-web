const mockFetchMeAsync = jest.fn();
jest.mock('@/entities/me', () => ({
  useFetchMeAsync: () => mockFetchMeAsync,
}));

import { renderHook } from '@testing-library/react';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import useIsWalletLinked from './use-is-wallet-linked.hook';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useIsWalletLinked', () => {
  test('FM이고 walletAddress가 있으면 true를 반환한다', async () => {
    mockFetchMeAsync.mockResolvedValue({
      authorityTier: AuthorityTier.FM,
      walletAddress: '0x1234',
    });

    const { result } = renderHook(() => useIsWalletLinked());
    const isLinked = await result.current();

    expect(isLinked).toBe(true);
  });

  test('FM이지만 walletAddress가 없으면 false를 반환한다', async () => {
    mockFetchMeAsync.mockResolvedValue({
      authorityTier: AuthorityTier.FM,
      walletAddress: '',
    });

    const { result } = renderHook(() => useIsWalletLinked());
    const isLinked = await result.current();

    expect(isLinked).toBe(false);
  });

  test('GT이면 walletAddress와 무관하게 false를 반환한다', async () => {
    mockFetchMeAsync.mockResolvedValue({
      authorityTier: AuthorityTier.GT,
      walletAddress: '0x1234',
    });

    const { result } = renderHook(() => useIsWalletLinked());
    const isLinked = await result.current();

    expect(isLinked).toBe(false);
  });
});

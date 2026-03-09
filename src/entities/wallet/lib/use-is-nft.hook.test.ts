const mockGetQueryData = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ getQueryData: mockGetQueryData }),
}));

import { renderHook } from '@testing-library/react';
import useIsNft from './use-is-nft.hook';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useIsNft', () => {
  test('NFT 목록에 URI가 존재하면 true를 반환한다', () => {
    mockGetQueryData.mockReturnValue([
      { resourceUri: 'https://example.com/nft1.png', available: true },
      { resourceUri: 'https://example.com/nft2.png', available: true },
    ]);

    const { result } = renderHook(() => useIsNft());
    expect(result.current('https://example.com/nft1.png')).toBe(true);
  });

  test('NFT 목록에 URI가 없으면 false를 반환한다', () => {
    mockGetQueryData.mockReturnValue([
      { resourceUri: 'https://example.com/nft1.png', available: true },
    ]);

    const { result } = renderHook(() => useIsNft());
    expect(result.current('https://example.com/nonexistent.png')).toBe(false);
  });

  test('NFT 데이터가 없으면 falsy를 반환한다', () => {
    mockGetQueryData.mockReturnValue(undefined);

    const { result } = renderHook(() => useIsNft());
    expect(result.current('https://example.com/nft1.png')).toBeFalsy();
  });
});

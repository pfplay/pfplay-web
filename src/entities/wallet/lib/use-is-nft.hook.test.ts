import { renderHook } from '@testing-library/react';
import useIsNft from './use-is-nft.hook';

describe('useIsNft (URI 형태 기반 판정)', () => {
  test('firebasestorage(내부 face) URI 는 NFT 가 아니다 → false', () => {
    const { result } = renderHook(() => useIsNft());
    expect(
      result.current(
        'https://firebasestorage.googleapis.com/v0/b/pfplay-firebase.appspot.com/o/ava_face%2Fface_001.png?alt=media'
      )
    ).toBe(false);
  });

  test('외부(cloudinary NFT 썸네일) URI 는 NFT 다 → true', () => {
    const { result } = renderHook(() => useIsNft());
    expect(
      result.current(
        'https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/550d48e536a5ac401158912a0b9a1c2f'
      )
    ).toBe(true);
  });

  test('회귀 가드: NFT 캐시/지갑 연결과 무관하게 외부 URI 는 항상 NFT 로 판정된다', () => {
    // 기존 버그(#432): 제출 시점에 휘발성 NFT 캐시 멤버십으로 재추론 → 캐시가 비면
    // 정상 NFT 얼굴이 INTERNAL_IMAGE 로 오분류돼 백엔드가 거부했다.
    // 형태 기반 판정은 캐시 상태에 의존하지 않는다.
    const { result } = renderHook(() => useIsNft());
    expect(result.current('https://example.com/some-nft.png')).toBe(true);
  });
});

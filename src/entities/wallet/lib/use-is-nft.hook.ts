/**
 * 내부(서비스 제공) face 리소스의 URI 접두어. 백엔드 AvatarRequestValidator 의
 * INTERNAL_IMAGE 검증과 동일한 계약 — 내부 face/body 는 항상 이 firebasestorage
 * 버킷에서 서빙된다.
 */
const INTERNAL_RESOURCE_URI_PREFIX =
  'https://firebasestorage.googleapis.com/v0/b/pfplay-firebase.appspot.com/';

/**
 * face URI 가 NFT(외부) 출처인지 형태로 판정한다.
 *
 * 과거엔 제출 시점에 휘발성 NFT 캐시(`[QueryKeys.Nfts]`) 멤버십으로 재추론했는데,
 * 그 캐시는 지갑 미연결 시 삭제되고(`useNfts`), 이미지 헬스체크 탈락분이 빠지며,
 * gcTime 으로 GC 된다. 캐시가 비면 정상 NFT 얼굴이 INTERNAL_IMAGE 로 오분류돼
 * 백엔드가 거부했다(#432). 내부 리소스는 항상 firebasestorage 접두어를 가지므로
 * "접두어가 아니면 NFT" 로 판정하면 캐시 상태와 무관하게 안정적이고, 백엔드
 * 검증 계약(INTERNAL_IMAGE=firebase, NFT_URI=http(s))과 정확히 일치한다.
 */
export default function useIsNft() {
  return (uri: string) => !uri.startsWith(INTERNAL_RESOURCE_URI_PREFIX);
}

import { extractVideoIdFromUrl } from '@/entities/music-preview';

/**
 * 음악 검색 입력 정규화.
 *
 * 사용자가 유튜브 URL을 붙여넣으면 videoId를 추출해 canonical
 * `https://www.youtube.com/watch?v={id}` 형태로 바꿔 검색어로 넘긴다.
 * (`youtu.be/…?list=LL`, `watch?v=…&list=LL&index=17` 등 노이즈가 붙은 URL은
 * 텍스트 검색이 빗나가는데, canonical 형태는 해당 영상을 정확히 반환함이 실측됨.)
 *
 * URL이 아니면(=videoId 추출 실패) 원본을 그대로 반환한다(일반 텍스트 검색).
 *
 * NOTE: shorts URL도 videoId는 추출되나, 유튜브 텍스트 검색이 shorts를
 * 반환하지 않아 결과 없음으로 degrade한다(shorts 지원은 스코프 밖).
 */
export function normalizeYoutubeSearchInput(input: string): string {
  const trimmed = input.trim();
  const videoId = extractVideoIdFromUrl(trimmed);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : trimmed;
}

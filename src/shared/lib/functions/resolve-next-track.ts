/**
 * 정렬된 트랙 id 목록에서 재생 커서 "다음"에 시작될 트랙 id를 파생한다(순환).
 * - 커서가 null/undefined이거나 목록에서 찾지 못하면(삭제) 첫 트랙.
 * - 빈 목록이면 null.
 *
 * NOTE: 백엔드 PlaybackCursorPolicy.startIndexAfterCursor와 동일 시맨틱.
 * 클라이언트가 (낙관적 재정렬을 반영한) 현재 순서로부터 직접 계산하므로
 * 재정렬 후 refetch 없이도 NEXT가 정확하게 유지된다.
 */
export function resolveNextTrackId(
  orderedTrackIds: number[],
  cursor: number | null | undefined
): number | null {
  if (orderedTrackIds.length === 0) return null;
  if (cursor == null) return orderedTrackIds[0];
  const idx = orderedTrackIds.indexOf(cursor);
  if (idx < 0) return orderedTrackIds[0];
  return orderedTrackIds[(idx + 1) % orderedTrackIds.length];
}

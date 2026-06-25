import type { Dj } from '@/shared/api/http/types/partyrooms';

/**
 * DJ 대기열 클러스터에 표시할 크루를 고른다.
 * 현재 DJ(orderNumber 1)는 제외하고, 다음 차례(orderNumber 오름차순)로 최대 `max`명만 선택한다.
 * 초과 인원은 반환하지 않으므로 호출부에서 플로어(court)로 자연스럽게 떨어진다.
 */
export const selectDjQueueClusterCrewIds = ({
  djs,
  currentDjCrewId,
  max,
}: {
  djs: Dj[];
  currentDjCrewId?: number;
  max: number;
}): number[] =>
  djs
    .filter((dj) => dj.crewId !== currentDjCrewId && dj.orderNumber > 1)
    .sort((a, b) => a.orderNumber - b.orderNumber)
    .slice(0, max)
    .map((dj) => dj.crewId);

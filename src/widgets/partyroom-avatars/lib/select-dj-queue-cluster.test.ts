import type { Dj } from '@/shared/api/http/types/partyrooms';
import { selectDjQueueClusterCrewIds } from './select-dj-queue-cluster';

const makeDj = (crewId: number, orderNumber: number): Dj => ({
  crewId,
  orderNumber,
  nickname: `User${crewId}`,
  avatarIconUri: '',
});

describe('selectDjQueueClusterCrewIds', () => {
  test('현재 DJ(orderNumber 1)는 대기열 클러스터에서 제외한다', () => {
    const djs = [makeDj(10, 1), makeDj(20, 2), makeDj(30, 3)];

    const result = selectDjQueueClusterCrewIds({ djs, currentDjCrewId: 10, max: 3 });

    expect(result).toEqual([20, 30]);
  });

  test('대기열 클러스터는 최대 max명까지만 노출한다', () => {
    const djs = [
      makeDj(10, 1),
      makeDj(20, 2),
      makeDj(30, 3),
      makeDj(40, 4),
      makeDj(50, 5),
      makeDj(60, 6),
    ];

    const result = selectDjQueueClusterCrewIds({ djs, currentDjCrewId: 10, max: 3 });

    expect(result).toHaveLength(3);
  });

  test('orderNumber가 빠른 순(다음 차례)으로 max명을 선택한다', () => {
    const djs = [
      makeDj(10, 1),
      makeDj(60, 6),
      makeDj(20, 2),
      makeDj(40, 4),
      makeDj(30, 3),
      makeDj(50, 5),
    ];

    const result = selectDjQueueClusterCrewIds({ djs, currentDjCrewId: 10, max: 3 });

    expect(result).toEqual([20, 30, 40]);
  });

  test('대기열이 max보다 적으면 있는 만큼 반환한다', () => {
    const djs = [makeDj(10, 1), makeDj(20, 2)];

    const result = selectDjQueueClusterCrewIds({ djs, currentDjCrewId: 10, max: 3 });

    expect(result).toEqual([20]);
  });

  test('대기열이 비면 빈 배열을 반환한다', () => {
    expect(selectDjQueueClusterCrewIds({ djs: [], currentDjCrewId: 10, max: 3 })).toEqual([]);
  });
});

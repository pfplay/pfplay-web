import { renderHook } from '@testing-library/react';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { useAvatarCluster } from './use-avatar-cluster.hook';

const makeCrew = (crewId: number) => ({
  crewId,
  nickname: `User${crewId}`,
  gradeType: GradeType.CLUBBER,
  avatarBodyUri: '',
  avatarFaceUri: '',
  avatarIconUri: '',
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
});

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
});

describe('useAvatarCluster', () => {
  test('빈 크루 리스트에서 빈 결과를 반환한다', () => {
    const { result } = renderHook(() => useAvatarCluster({ crews: [], djQueueCrewIds: [] }));

    expect(result.current.courtPositions).toEqual([]);
    expect(result.current.queuePositions).toEqual([]);
  });

  test('크루에 position을 할당한다', () => {
    const crews = [makeCrew(1), makeCrew(2), makeCrew(3)];

    const { result } = renderHook(() => useAvatarCluster({ crews, djQueueCrewIds: [] }));

    expect(result.current.courtPositions).toHaveLength(3);
    result.current.courtPositions.forEach((c) => {
      expect(c.position).toHaveProperty('x');
      expect(c.position).toHaveProperty('y');
      expect(typeof c.position.x).toBe('number');
    });
  });

  test('DJ 대기열 크루를 분리한다', () => {
    const crews = [makeCrew(1), makeCrew(2), makeCrew(3)];

    const { result } = renderHook(() => useAvatarCluster({ crews, djQueueCrewIds: [2] }));

    expect(result.current.courtPositions).toHaveLength(2);
    expect(result.current.queuePositions).toHaveLength(1);
    expect(result.current.queuePositions[0].crewId).toBe(2);
  });

  test('모든 position이 유한한 숫자이다', () => {
    const crews = Array.from({ length: 10 }, (_, i) => makeCrew(i + 1));

    const { result } = renderHook(() => useAvatarCluster({ crews, djQueueCrewIds: [3, 7] }));

    [...result.current.courtPositions, ...result.current.queuePositions].forEach((c) => {
      expect(Number.isFinite(c.position.x)).toBe(true);
      expect(Number.isFinite(c.position.y)).toBe(true);
    });
  });
});

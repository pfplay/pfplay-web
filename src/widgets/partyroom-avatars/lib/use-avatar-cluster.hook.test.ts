import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { useAvatarCluster } from './use-avatar-cluster.hook';
import { OVAL_CONFIG_QUEUE } from '../model/constants';

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

const getMinDistance = (positions: { position: { x: number; y: number } }[]) => {
  let minDistance = Infinity;

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].position.x - positions[j].position.x;
      const dy = positions[i].position.y - positions[j].position.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      minDistance = Math.min(minDistance, distance);
    }
  }

  return minDistance;
};

const withSeededRandom = <T>(seed: number, callback: () => T) => {
  let state = seed >>> 0;
  const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  });

  try {
    return callback();
  } finally {
    randomSpy.mockRestore();
  }
};

const getNormalizedRadius = (position: { x: number; y: number }) => {
  const centerX = 1920 * OVAL_CONFIG_QUEUE.CENTER_X_RATIO;
  const centerY = 1080 * OVAL_CONFIG_QUEUE.CENTER_Y_RATIO;
  const radiusX = 1920 * OVAL_CONFIG_QUEUE.RADIUS_X_RATIO;
  const radiusY = 1080 * OVAL_CONFIG_QUEUE.RADIUS_Y_RATIO;

  return Math.sqrt(
    ((position.x - centerX) / radiusX) ** 2 + ((position.y - centerY) / radiusY) ** 2
  );
};

const getSpread = (values: number[]) => Math.max(...values) - Math.min(...values);

describe('useAvatarCluster', () => {
  test('빈 크루 리스트에서 빈 결과를 반환한다', () => {
    const { result } = renderHook(() =>
      useAvatarCluster({
        crews: [],
        djQueueCrewIds: [],
        stageBounds: { width: 1920, height: 1080 },
      })
    );

    expect(result.current.courtPositions).toEqual([]);
    expect(result.current.queuePositions).toEqual([]);
  });

  test('크루에 position을 할당한다', () => {
    const crews = [makeCrew(1), makeCrew(2), makeCrew(3)];

    const { result } = renderHook(() =>
      useAvatarCluster({ crews, djQueueCrewIds: [], stageBounds: { width: 1920, height: 1080 } })
    );

    expect(result.current.courtPositions).toHaveLength(3);
    result.current.courtPositions.forEach((c) => {
      expect(c.position).toHaveProperty('x');
      expect(c.position).toHaveProperty('y');
      expect(typeof c.position.x).toBe('number');
    });
  });

  test('DJ 대기열 크루를 분리한다', () => {
    const crews = [makeCrew(1), makeCrew(2), makeCrew(3)];

    const { result } = renderHook(() =>
      useAvatarCluster({
        crews,
        djQueueCrewIds: [2],
        stageBounds: { width: 1920, height: 1080 },
      })
    );

    expect(result.current.courtPositions).toHaveLength(2);
    expect(result.current.queuePositions).toHaveLength(1);
    expect(result.current.queuePositions[0].crewId).toBe(2);
  });

  test('DJ 대기열은 crews 배열 순서가 아니라 djQueueCrewIds 순서를 유지한다', () => {
    const crews = [makeCrew(1), makeCrew(2), makeCrew(3), makeCrew(4)];

    const { result, rerender } = renderHook(
      ({ djQueueCrewIds }) =>
        useAvatarCluster({
          crews,
          djQueueCrewIds,
          stageBounds: { width: 1920, height: 1080 },
        }),
      {
        initialProps: { djQueueCrewIds: [4, 2, 3] },
      }
    );

    expect(result.current.queuePositions.map((position) => position.crewId)).toEqual([4, 2, 3]);

    rerender({ djQueueCrewIds: [2, 4, 3] });

    expect(result.current.queuePositions.map((position) => position.crewId)).toEqual([2, 4, 3]);
  });

  test('모든 position이 유한한 숫자이다', () => {
    const crews = Array.from({ length: 10 }, (_, i) => makeCrew(i + 1));

    const { result } = renderHook(() =>
      useAvatarCluster({
        crews,
        djQueueCrewIds: [3, 7],
        stageBounds: { width: 1920, height: 1080 },
      })
    );

    [...result.current.courtPositions, ...result.current.queuePositions].forEach((c) => {
      expect(Number.isFinite(c.position.x)).toBe(true);
      expect(Number.isFinite(c.position.y)).toBe(true);
    });
  });

  test('stage bounds가 바뀌면 기존 위치를 새 스테이지 비율에 맞춰 재계산한다', () => {
    const crews = [makeCrew(1), makeCrew(2), makeCrew(3)];

    const { result, rerender } = renderHook(
      ({ stageBounds }) => useAvatarCluster({ crews, djQueueCrewIds: [], stageBounds }),
      {
        initialProps: { stageBounds: { width: 1920, height: 1080 } },
      }
    );

    const initialPositions = result.current.courtPositions;

    rerender({ stageBounds: { width: 960, height: 540 } });

    const resizedPositions = result.current.courtPositions;

    expect(resizedPositions).toHaveLength(initialPositions.length);
    resizedPositions.forEach((position, index) => {
      expect(position.position.x).not.toBe(initialPositions[index].position.x);
      expect(position.position.y).not.toBe(initialPositions[index].position.y);
      expect(position.position.x).toBeGreaterThanOrEqual(0);
      expect(position.position.y).toBeGreaterThanOrEqual(0);
      expect(
        Math.abs(position.position.x - initialPositions[index].position.x / 2)
      ).toBeLessThanOrEqual(20);
      expect(
        Math.abs(position.position.y - initialPositions[index].position.y / 2)
      ).toBeLessThanOrEqual(20);
    });
  });

  test('새 크루가 추가되어도 기존 크루 좌표는 유지된다', () => {
    const initialCrews = [makeCrew(1), makeCrew(2), makeCrew(3)];
    const addedCrews = [...initialCrews, makeCrew(4)];

    const { result, rerender } = renderHook(
      ({ crews }) =>
        useAvatarCluster({
          crews,
          djQueueCrewIds: [],
          stageBounds: { width: 1920, height: 1080 },
        }),
      {
        initialProps: { crews: initialCrews },
      }
    );

    const initialMap = new Map(
      result.current.courtPositions.map(({ crewId, position }) => [crewId, position] as const)
    );

    rerender({ crews: addedCrews });

    initialCrews.forEach(({ crewId }) => {
      const nextPosition = result.current.courtPositions.find(
        (crew) => crew.crewId === crewId
      )?.position;
      expect(nextPosition).toEqual(initialMap.get(crewId));
    });
  });

  test('20명 queue + 50명 floor에서도 군집이 stage bounds 안에 유지된다', () => {
    withSeededRandom(19, () => {
      const crews = Array.from({ length: 71 }, (_, index) => makeCrew(index + 1));
      const djQueueCrewIds = Array.from({ length: 20 }, (_, index) => index + 2);

      const { result } = renderHook(() =>
        useAvatarCluster({
          crews,
          djQueueCrewIds,
          stageBounds: { width: 1920, height: 1080 },
        })
      );

      expect(result.current.queuePositions).toHaveLength(20);
      expect(result.current.courtPositions).toHaveLength(51);

      [...result.current.queuePositions, ...result.current.courtPositions].forEach(
        ({ position }) => {
          expect(position.x).toBeGreaterThanOrEqual(0);
          expect(position.x).toBeLessThanOrEqual(1920);
          expect(position.y).toBeGreaterThanOrEqual(0);
          expect(position.y).toBeLessThanOrEqual(1080);
        }
      );

      expect(getMinDistance(result.current.queuePositions)).toBeGreaterThanOrEqual(20);
      expect(getMinDistance(result.current.courtPositions)).toBeGreaterThanOrEqual(2);
    });
  });

  test('queue 아바타는 대체로 군집 중심에서 바깥쪽으로 순차 배치된다', () => {
    withSeededRandom(42, () => {
      const queueCrews = Array.from({ length: 10 }, (_, index) => makeCrew(index + 1));
      const radiusByCrewId = new Map<number, number>();

      const { result, rerender } = renderHook(
        ({ crews }) =>
          useAvatarCluster({
            crews,
            djQueueCrewIds: crews.map((crew) => crew.crewId),
            stageBounds: { width: 1920, height: 1080 },
          }),
        {
          initialProps: { crews: queueCrews.slice(0, 1) },
        }
      );

      const firstQueueCrew = result.current.queuePositions[0];
      expect(firstQueueCrew).toBeDefined();
      radiusByCrewId.set(1, getNormalizedRadius(firstQueueCrew.position));

      for (let count = 2; count <= queueCrews.length; count++) {
        rerender({ crews: queueCrews.slice(0, count) });
        const addedCrew = result.current.queuePositions.find((crew) => crew.crewId === count);
        expect(addedCrew).toBeDefined();
        if (addedCrew) {
          radiusByCrewId.set(count, getNormalizedRadius(addedCrew.position));
        }
      }

      const getRadius = (crewId: number) => {
        const radius = radiusByCrewId.get(crewId);
        expect(radius).toBeDefined();
        return radius ?? 0;
      };

      const earlyAverage = (getRadius(1) + getRadius(2) + getRadius(3)) / 3;
      const lateAverage = (getRadius(8) + getRadius(9) + getRadius(10)) / 3;

      expect(lateAverage).toBeGreaterThan(earlyAverage + 0.12);
    });
  });

  test('queue 초반 아바타는 가로 일자 대신 작은 군집으로 시작한다', () => {
    withSeededRandom(7, () => {
      const crews = Array.from({ length: 4 }, (_, index) => makeCrew(index + 1));

      const { result } = renderHook(() =>
        useAvatarCluster({
          crews,
          djQueueCrewIds: crews.map((crew) => crew.crewId),
          stageBounds: { width: 1920, height: 1080 },
        })
      );

      const xValues = result.current.queuePositions.map(({ position }) => position.x);
      const yValues = result.current.queuePositions.map(({ position }) => position.y);

      expect(getSpread(xValues)).toBeGreaterThan(60);
      expect(getSpread(yValues)).toBeGreaterThan(20);
    });
  });

  test('listener 초반 아바타도 작은 군집으로 시작한다', () => {
    withSeededRandom(11, () => {
      const crews = Array.from({ length: 4 }, (_, index) => makeCrew(index + 1));

      const { result } = renderHook(() =>
        useAvatarCluster({
          crews,
          djQueueCrewIds: [],
          stageBounds: { width: 1920, height: 1080 },
        })
      );

      const xValues = result.current.courtPositions.map(({ position }) => position.x);
      const yValues = result.current.courtPositions.map(({ position }) => position.y);

      expect(getSpread(xValues)).toBeGreaterThan(30);
      expect(getSpread(yValues)).toBeGreaterThan(30);
    });
  });
});

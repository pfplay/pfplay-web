import { useEffect, useState, useRef } from 'react';
import {
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceCollide,
  SimulationNodeDatum,
} from 'd3-force';
import { Crew } from '@/entities/current-partyroom';
import { Point } from '../model/avatar-position.model';
import {
  D3_OPTIONS_FOR_ADDED_NODES,
  D3_OPTIONS_FOR_INITIAL_NODES,
  OVAL_CONFIG_COURT,
  OVAL_CONFIG_QUEUE,
  OvalConfig,
} from '../model/constants';

type D3Node = SimulationNodeDatum & Crew.Model & { fx?: number; fy?: number };
type PositionedCrew = Crew.Model & { position: Point };
export type CrewPosition = { crewId: number; position: Point };

export type OvalBounds = {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
};

// 두 점 사이의 거리 계산
const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

// 타원 내부에 랜덤 위치 생성
const generateEllipsePosition = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  radiusRatio: number
): Point => {
  const angle = Math.random() * 2 * Math.PI;
  return {
    x: centerX + radiusRatio * radiusX * Math.cos(angle),
    y: centerY + radiusRatio * radiusY * Math.sin(angle),
  };
};

// 타원 내부에 있는지 확인
const isWithinEllipse = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): boolean => {
  const dx = x - centerX;
  const dy = y - centerY;
  const normalized = (dx / radiusX) ** 2 + (dy / radiusY) ** 2;
  return normalized <= 1;
};

// 노드가 타원을 벗어나면 강제로 집어넣음
const constrainToEllipse = (
  node: D3Node,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  constraint: number
): void => {
  const dx = (node.x ?? centerX) - centerX;
  const dy = (node.y ?? centerY) - centerY;

  if (!isWithinEllipse(node.x ?? centerX, node.y ?? centerY, centerX, centerY, radiusX, radiusY)) {
    const angle = Math.atan2(dy, dx);
    node.x = centerX + Math.cos(angle) * radiusX * constraint;
    node.y = centerY + Math.sin(angle) * radiusY * constraint;
  }
};

/**
 * 단일 클러스터 시뮬레이션을 실행하는 순수 함수
 * 궁중용 / 대기열용 등 동일한 로직으로 서로 다른 설정을 적용할 수 있음
 */
function runClusterSimulation({
  crews,
  existingNodes,
  ovalConfig,
}: {
  crews: Crew.Model[];
  existingNodes: D3Node[];
  ovalConfig: OvalConfig;
}): { positionedCrews: PositionedCrew[]; updatedNodes: D3Node[] } {
  if (crews.length === 0) {
    return { positionedCrews: [], updatedNodes: [] };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width * ovalConfig.CENTER_X_RATIO;
  const centerY = height * ovalConfig.CENTER_Y_RATIO;

  const existingIds = new Set(existingNodes.map((n) => n.crewId));
  const incomingIds = new Set(crews.map((c) => c.crewId));
  const d3Options =
    crews.length > 5 || existingIds.size > 0
      ? D3_OPTIONS_FOR_ADDED_NODES
      : D3_OPTIONS_FOR_INITIAL_NODES;

  const ovalRadiusX = width * ovalConfig.RADIUS_X_RATIO;
  const ovalRadiusY = height * ovalConfig.RADIUS_Y_RATIO;

  const boundaryConstraint =
    crews.length > 20 ? 0.8 : crews.length > 10 ? 0.85 : ovalConfig.BOUNDARY_CONSTRAINT;

  const aspectRatio = ovalRadiusX / ovalRadiusY;
  const forceYStrength = ovalConfig.FORCE_Y_STRENGTH * (aspectRatio / 1.2);

  const findAvailablePosition = (existingPositions: Point[]): Point => {
    const minDistance = d3Options.MIN_DISTANCE;
    const maxAttempts = d3Options.MAX_ATTEMPTS;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const radiusRatio = Math.sqrt(Math.random());
      const position = generateEllipsePosition(
        centerX,
        centerY,
        ovalRadiusX,
        ovalRadiusY,
        radiusRatio
      );

      const isAvailable = existingPositions.every(
        (pos) => calculateDistance(position, pos) >= minDistance
      );

      if (isAvailable) {
        return position;
      }
    }

    // 그래도 없으면 최소 거리 줄여가며 재시도
    const reducedDistances = [minDistance * 0.7, minDistance * 0.5, minDistance * 0.3, 15];

    for (const reducedDistance of reducedDistances) {
      for (let attempt = 0; attempt < 50; attempt++) {
        const radiusRatio = Math.sqrt(Math.random());
        const position = generateEllipsePosition(
          centerX,
          centerY,
          ovalRadiusX,
          ovalRadiusY,
          radiusRatio
        );

        const isAvailable = existingPositions.every(
          (pos) => calculateDistance(position, pos) >= reducedDistance
        );

        if (isAvailable) {
          return position;
        }
      }
    }

    let bestPosition = generateEllipsePosition(
      centerX,
      centerY,
      ovalRadiusX,
      ovalRadiusY,
      ovalConfig.FALLBACK_RADIUS_RATIO
    );
    let maxMinDistance = 0;

    for (let attempt = 0; attempt < 30; attempt++) {
      const radiusRatio = Math.sqrt(Math.random());
      const candidate = generateEllipsePosition(
        centerX,
        centerY,
        ovalRadiusX,
        ovalRadiusY,
        radiusRatio
      );

      const minDistToExisting = existingPositions.reduce((min, pos) => {
        const dist = calculateDistance(candidate, pos);
        return Math.min(min, dist);
      }, Infinity);

      // 그래도 없다면 가장 멀리 있는 위치 선택
      if (minDistToExisting > maxMinDistance) {
        maxMinDistance = minDistToExisting;
        bestPosition = candidate;
      }
    }

    return bestPosition;
  };

  // 기존 노드 위치 고정
  const keptNodes = existingNodes.map((n) => {
    if (!incomingIds.has(n.crewId)) return n;

    const updatedCrew = crews.find((c) => c.crewId === n.crewId);
    if (!updatedCrew) return n;

    return {
      ...updatedCrew,
      x: n.x,
      y: n.y,
      fx: n.x,
      fy: n.y,
    };
  });

  // 기존 노드들의 위치 정보
  const existingPositions = keptNodes
    .filter((n) => incomingIds.has(n.crewId))
    .map((n) => ({ x: n.x ?? centerX, y: n.y ?? centerY }));

  // 추가된 노드를 기존 노드들과 충돌하지 않는 위치에 배치
  const addedNodes: D3Node[] = crews
    .filter((c) => !existingIds.has(c.crewId))
    .map((crew) => {
      const position = findAvailablePosition(existingPositions);
      existingPositions.push(position);
      return {
        ...crew,
        x: position.x,
        y: position.y,
      };
    });

  // 제거된 노드 제외
  const updatedNodes: D3Node[] = [
    ...addedNodes,
    ...keptNodes.filter((n) => incomingIds.has(n.crewId)),
  ];

  const ellipseBoundary = () => {
    updatedNodes.forEach((node) => {
      constrainToEllipse(node, centerX, centerY, ovalRadiusX, ovalRadiusY, boundaryConstraint);
    });
  };

  const simulation = forceSimulation(updatedNodes)
    .force('x', forceX(centerX).strength(ovalConfig.FORCE_X_STRENGTH))
    .force('y', forceY(centerY).strength(forceYStrength))
    .force('charge', forceManyBody().strength(d3Options.FORCE_STRENGTH))
    .force('collision', forceCollide().radius(d3Options.COLLIDE_RADIUS))
    .force('ellipse', ellipseBoundary)
    .stop();

  const tickCount =
    updatedNodes.length > 20 ? ovalConfig.SIMULATION_TICKS * 1.5 : ovalConfig.SIMULATION_TICKS;

  for (let i = 0; i < tickCount; i++) {
    simulation.tick();
  }

  updatedNodes.forEach((node) => {
    const x = node.x ?? centerX;
    const y = node.y ?? centerY;

    if (!isWithinEllipse(x, y, centerX, centerY, ovalRadiusX, ovalRadiusY)) {
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx);
      node.x = centerX + Math.cos(angle) * ovalRadiusX * boundaryConstraint;
      node.y = centerY + Math.sin(angle) * ovalRadiusY * boundaryConstraint;
    }
  });

  simulation.stop();

  const positionedCrews: PositionedCrew[] = updatedNodes.map((n) => ({
    ...n,
    position: {
      x: Math.round(n.x ?? centerX),
      y: Math.round(n.y ?? centerY),
    },
  }));

  return { positionedCrews, updatedNodes };
}

export function useAvatarCluster({
  crews,
  djQueueCrewIds,
}: {
  crews: Crew.Model[];
  djQueueCrewIds: number[];
}): {
  courtPositions: CrewPosition[];
  queuePositions: CrewPosition[];
} {
  const [courtClustered, setCourtClustered] = useState<PositionedCrew[]>([]);
  const [queueClustered, setQueueClustered] = useState<PositionedCrew[]>([]);

  const courtNodesRef = useRef<D3Node[]>([]);
  const queueNodesRef = useRef<D3Node[]>([]);
  const prevCrewIdsRef = useRef<string>('');
  const prevQueueIdsRef = useRef<string>('');

  useEffect(() => {
    const currentCrewIdsKey = JSON.stringify(crews.map((c) => c.crewId).sort());
    const currentQueueIdsKey = JSON.stringify([...djQueueCrewIds].sort());

    if (
      prevCrewIdsRef.current === currentCrewIdsKey &&
      prevQueueIdsRef.current === currentQueueIdsKey
    ) {
      return; // 미변경 시 early return
    }

    prevCrewIdsRef.current = currentCrewIdsKey;
    prevQueueIdsRef.current = currentQueueIdsKey;

    const djQueueIdSet = new Set(djQueueCrewIds);

    const courtCrews = crews.filter((c) => !djQueueIdSet.has(c.crewId));
    const queueCrews = crews.filter((c) => djQueueIdSet.has(c.crewId));

    const courtResult = runClusterSimulation({
      crews: courtCrews,
      existingNodes: courtNodesRef.current,
      ovalConfig: OVAL_CONFIG_COURT,
    });
    courtNodesRef.current = courtResult.updatedNodes;
    setCourtClustered(courtResult.positionedCrews);

    const queueResult = runClusterSimulation({
      crews: queueCrews,
      existingNodes: queueNodesRef.current,
      ovalConfig: OVAL_CONFIG_QUEUE,
    });

    queueNodesRef.current = queueResult.updatedNodes;
    setQueueClustered(queueResult.positionedCrews);
  }, [crews, djQueueCrewIds]);

  return {
    courtPositions: courtClustered.map(({ crewId, position }) => ({ crewId, position })),
    queuePositions: queueClustered.map(({ crewId, position }) => ({ crewId, position })),
  };
}

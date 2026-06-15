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
export type StageBounds = { width: number; height: number };

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

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

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

const getEstimatedClusterCapacity = ({
  radiusX,
  radiusY,
  minDistance,
}: {
  radiusX: number;
  radiusY: number;
  minDistance: number;
}) => {
  const ellipseArea = Math.PI * radiusX * radiusY;
  const footprint = Math.max(minDistance, 1) ** 2 * 0.9;
  return Math.max(12, Math.round(ellipseArea / footprint));
};

const sampleRadiusRatioInBand = (minRadiusRatio: number, maxRadiusRatio: number) => {
  const inner = clamp(minRadiusRatio, 0, 0.98);
  const outer = clamp(Math.max(maxRadiusRatio, inner + 0.01), inner + 0.01, 0.99);
  const innerArea = inner ** 2;
  const outerArea = outer ** 2;
  return Math.sqrt(innerArea + Math.random() * (outerArea - innerArea));
};

const getPreferredRadiusBands = ({
  occupiedCount,
  estimatedCapacity,
}: {
  occupiedCount: number;
  estimatedCapacity: number;
}) => {
  const occupancyRatio = clamp(occupiedCount / Math.max(estimatedCapacity - 1, 1), 0, 1);
  const targetRadiusRatio = 0.12 + occupancyRatio * 0.74;

  return [
    [targetRadiusRatio - 0.08, targetRadiusRatio + 0.08],
    [targetRadiusRatio - 0.18, targetRadiusRatio + 0.16],
    [targetRadiusRatio - 0.3, targetRadiusRatio + 0.24],
    [0.04, 0.96],
  ].map(([min, max]) => ({
    min: clamp(min, 0.04, 0.96),
    max: clamp(max, 0.08, 0.98),
  }));
};

const FLAT_COMPACT_CLUSTER_SLOT_OFFSETS = [
  { x: 0, y: 0 },
  { x: -0.18, y: -0.28 },
  { x: 0.18, y: 0.24 },
  { x: -0.24, y: 0.18 },
  { x: 0.24, y: -0.2 },
  { x: -0.36, y: -0.04 },
  { x: 0.36, y: 0.04 },
  { x: 0, y: -0.42 },
];

const ROUND_COMPACT_CLUSTER_SLOT_OFFSETS = [
  { x: 0, y: 0 },
  { x: -0.12, y: -0.16 },
  { x: 0.13, y: -0.05 },
  { x: -0.04, y: 0.13 },
  { x: 0.15, y: 0.11 },
  { x: -0.19, y: 0.04 },
  { x: 0.03, y: -0.23 },
  { x: 0.22, y: -0.16 },
];

const getCompactClusterSlotOffsets = (radiusX: number, radiusY: number) =>
  radiusY / radiusX < 0.6 ? FLAT_COMPACT_CLUSTER_SLOT_OFFSETS : ROUND_COMPACT_CLUSTER_SLOT_OFFSETS;

const getCompactClusterSlotPosition = ({
  occupiedCount,
  centerX,
  centerY,
  radiusX,
  radiusY,
  slotOffsets,
}: {
  occupiedCount: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  slotOffsets: { x: number; y: number }[];
}) => {
  const slot = slotOffsets[occupiedCount];
  if (!slot) {
    return null;
  }

  const jitterScale = occupiedCount === 0 ? 0 : 0.015;
  const jitterX = (Math.random() - 0.5) * jitterScale;
  const jitterY = (Math.random() - 0.5) * jitterScale;

  return {
    x: centerX + (slot.x + jitterX) * radiusX,
    y: centerY + (slot.y + jitterY) * radiusY,
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

const enforceNodeSpacing = ({
  nodes,
  centerX,
  centerY,
  radiusX,
  radiusY,
  boundaryConstraint,
  minDistance,
  lockedCrewIds,
}: {
  nodes: D3Node[];
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  boundaryConstraint: number;
  minDistance: number;
  lockedCrewIds: Set<number>;
}) => {
  for (let pass = 0; pass < 6; pass++) {
    let moved = false;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const ax = a.x ?? centerX;
        const ay = a.y ?? centerY;
        const bx = b.x ?? centerX;
        const by = b.y ?? centerY;
        const dx = bx - ax;
        const dy = by - ay;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const isALocked = lockedCrewIds.has(a.crewId);
        const isBLocked = lockedCrewIds.has(b.crewId);

        if (distance >= minDistance || (isALocked && isBLocked)) {
          continue;
        }

        moved = true;
        const safeDistance = distance || 0.001;
        const overlap = minDistance - safeDistance;
        const offsetX = (dx / safeDistance) * overlap;
        const offsetY = (dy / safeDistance) * overlap;

        if (isALocked) {
          b.x = bx + offsetX;
          b.y = by + offsetY;
          constrainToEllipse(b, centerX, centerY, radiusX, radiusY, boundaryConstraint);
          continue;
        }

        if (isBLocked) {
          a.x = ax - offsetX;
          a.y = ay - offsetY;
          constrainToEllipse(a, centerX, centerY, radiusX, radiusY, boundaryConstraint);
          continue;
        }

        a.x = ax - offsetX / 2;
        a.y = ay - offsetY / 2;
        b.x = bx + offsetX / 2;
        b.y = by + offsetY / 2;

        constrainToEllipse(a, centerX, centerY, radiusX, radiusY, boundaryConstraint);
        constrainToEllipse(b, centerX, centerY, radiusX, radiusY, boundaryConstraint);
      }
    }

    if (!moved) {
      break;
    }
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
  stageBounds,
  prevStageBounds,
}: {
  crews: Crew.Model[];
  existingNodes: D3Node[];
  ovalConfig: OvalConfig;
  stageBounds: StageBounds;
  prevStageBounds?: StageBounds;
}): { positionedCrews: PositionedCrew[]; updatedNodes: D3Node[] } {
  if (crews.length === 0) {
    return { positionedCrews: [], updatedNodes: [] };
  }

  const { width, height } = stageBounds;
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

  const findAvailablePosition = (
    existingPositions: Point[]
  ): { position: Point; lockToPosition: boolean } => {
    const minDistance = ovalConfig.MIN_DISTANCE;
    const maxAttempts = d3Options.MAX_ATTEMPTS;
    const compactSlotOffsets = getCompactClusterSlotOffsets(ovalRadiusX, ovalRadiusY);
    const shouldUseCompactSlots = existingPositions.length < compactSlotOffsets.length;

    if (shouldUseCompactSlots) {
      const compactSlot = getCompactClusterSlotPosition({
        occupiedCount: existingPositions.length,
        centerX,
        centerY,
        radiusX: ovalRadiusX,
        radiusY: ovalRadiusY,
        slotOffsets: compactSlotOffsets,
      });

      if (
        compactSlot &&
        existingPositions.every((pos) => calculateDistance(compactSlot, pos) >= minDistance * 0.9)
      ) {
        return { position: compactSlot, lockToPosition: true };
      }
    }

    const estimatedCapacity = getEstimatedClusterCapacity({
      radiusX: ovalRadiusX,
      radiusY: ovalRadiusY,
      minDistance,
    });
    const radiusBands = getPreferredRadiusBands({
      occupiedCount: existingPositions.length,
      estimatedCapacity,
    });

    for (const band of radiusBands) {
      for (let attempt = 0; attempt < maxAttempts / radiusBands.length; attempt++) {
        const radiusRatio = sampleRadiusRatioInBand(band.min, band.max);
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
          return { position, lockToPosition: false };
        }
      }
    }

    const reducedDistances = [minDistance * 0.8, minDistance * 0.65, minDistance * 0.5, 20];

    for (const reducedDistance of reducedDistances) {
      for (const band of radiusBands) {
        for (let attempt = 0; attempt < 20; attempt++) {
          const radiusRatio = sampleRadiusRatioInBand(band.min, band.max);
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
            return { position, lockToPosition: false };
          }
        }
      }
    }

    let bestPosition = generateEllipsePosition(
      centerX,
      centerY,
      ovalRadiusX,
      ovalRadiusY,
      radiusBands[0]?.min ?? ovalConfig.FALLBACK_RADIUS_RATIO
    );
    let maxMinDistance = 0;

    for (let attempt = 0; attempt < 30; attempt++) {
      const band = radiusBands[Math.min(radiusBands.length - 1, attempt % radiusBands.length)];
      const radiusRatio = sampleRadiusRatioInBand(band.min, band.max);
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

    return { position: bestPosition, lockToPosition: false };
  };

  const normalizeNodeToStage = (node: D3Node): D3Node => {
    if (!prevStageBounds) {
      return node;
    }

    const prevCenterX = prevStageBounds.width * ovalConfig.CENTER_X_RATIO;
    const prevCenterY = prevStageBounds.height * ovalConfig.CENTER_Y_RATIO;
    const prevRadiusX = prevStageBounds.width * ovalConfig.RADIUS_X_RATIO;
    const prevRadiusY = prevStageBounds.height * ovalConfig.RADIUS_Y_RATIO;
    const x = node.x ?? prevCenterX;
    const y = node.y ?? prevCenterY;

    const normalizedX = prevRadiusX === 0 ? 0 : (x - prevCenterX) / prevRadiusX;
    const normalizedY = prevRadiusY === 0 ? 0 : (y - prevCenterY) / prevRadiusY;
    const nextX = centerX + normalizedX * ovalRadiusX;
    const nextY = centerY + normalizedY * ovalRadiusY;

    return {
      ...node,
      x: nextX,
      y: nextY,
      fx: nextX,
      fy: nextY,
    };
  };

  // 기존 노드 위치 고정
  const keptNodes = existingNodes.map((n) => {
    if (!incomingIds.has(n.crewId)) return n;

    const updatedCrew = crews.find((c) => c.crewId === n.crewId);
    if (!updatedCrew) return n;

    return normalizeNodeToStage({
      ...updatedCrew,
      x: n.x,
      y: n.y,
      fx: n.x,
      fy: n.y,
    });
  });

  // 기존 노드들의 위치 정보
  const existingPositions = keptNodes
    .filter((n) => incomingIds.has(n.crewId))
    .map((n) => ({ x: n.x ?? centerX, y: n.y ?? centerY }));

  // 추가된 노드를 기존 노드들과 충돌하지 않는 위치에 배치
  const addedNodes: D3Node[] = crews
    .filter((c) => !existingIds.has(c.crewId))
    .map((crew) => {
      const { position, lockToPosition } = findAvailablePosition(existingPositions);
      existingPositions.push(position);
      return {
        ...crew,
        x: position.x,
        y: position.y,
        fx: lockToPosition ? position.x : undefined,
        fy: lockToPosition ? position.y : undefined,
      };
    });

  // 제거된 노드 제외
  const updatedNodes: D3Node[] = [
    ...addedNodes,
    ...keptNodes.filter((n) => incomingIds.has(n.crewId)),
  ];
  const lockedCrewIds = new Set(
    keptNodes.filter((n) => incomingIds.has(n.crewId)).map((n) => n.crewId)
  );

  const ellipseBoundary = () => {
    updatedNodes.forEach((node) => {
      constrainToEllipse(node, centerX, centerY, ovalRadiusX, ovalRadiusY, boundaryConstraint);
    });
  };

  const simulation = forceSimulation(updatedNodes)
    .force('x', forceX(centerX).strength(ovalConfig.FORCE_X_STRENGTH))
    .force('y', forceY(centerY).strength(forceYStrength))
    .force('charge', forceManyBody().strength(d3Options.FORCE_STRENGTH))
    .force('collision', forceCollide().radius(ovalConfig.COLLIDE_RADIUS))
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

  enforceNodeSpacing({
    nodes: updatedNodes,
    centerX,
    centerY,
    radiusX: ovalRadiusX,
    radiusY: ovalRadiusY,
    boundaryConstraint,
    minDistance: ovalConfig.MIN_DISTANCE,
    lockedCrewIds,
  });

  simulation.stop();

  const positionedCrews: PositionedCrew[] = updatedNodes.map((n) => ({
    ...n,
    position: {
      x: Math.max(0, Math.min(width, Math.round(n.x ?? centerX))),
      y: Math.max(0, Math.min(height, Math.round(n.y ?? centerY))),
    },
  }));

  return { positionedCrews, updatedNodes };
}

export function useAvatarCluster({
  crews,
  djQueueCrewIds,
  stageBounds,
}: {
  crews: Crew.Model[];
  djQueueCrewIds: number[];
  stageBounds: StageBounds;
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
  const prevCourtStageBoundsRef = useRef<StageBounds>();
  const prevQueueStageBoundsRef = useRef<StageBounds>();

  useEffect(() => {
    if (stageBounds.width <= 0 || stageBounds.height <= 0) {
      return;
    }

    const currentCrewIdsKey = JSON.stringify(crews.map((c) => c.crewId).sort());
    const currentQueueIdsKey = JSON.stringify(djQueueCrewIds);
    const stageBoundsChanged =
      prevCourtStageBoundsRef.current?.width !== stageBounds.width ||
      prevCourtStageBoundsRef.current?.height !== stageBounds.height;

    if (
      prevCrewIdsRef.current === currentCrewIdsKey &&
      prevQueueIdsRef.current === currentQueueIdsKey &&
      !stageBoundsChanged
    ) {
      return; // 미변경 시 early return
    }

    prevCrewIdsRef.current = currentCrewIdsKey;
    prevQueueIdsRef.current = currentQueueIdsKey;

    const crewMap = new Map(crews.map((crew) => [crew.crewId, crew]));
    const djQueueIdSet = new Set(djQueueCrewIds);

    const courtCrews = crews.filter((c) => !djQueueIdSet.has(c.crewId));
    const queueCrews = djQueueCrewIds
      .map((crewId) => crewMap.get(crewId))
      .filter((crew): crew is Crew.Model => !!crew);

    const courtResult = runClusterSimulation({
      crews: courtCrews,
      existingNodes: courtNodesRef.current,
      ovalConfig: OVAL_CONFIG_COURT,
      stageBounds,
      prevStageBounds: prevCourtStageBoundsRef.current,
    });
    courtNodesRef.current = courtResult.updatedNodes;
    setCourtClustered(courtResult.positionedCrews);
    prevCourtStageBoundsRef.current = stageBounds;

    const queueResult = runClusterSimulation({
      crews: queueCrews,
      existingNodes: queueNodesRef.current,
      ovalConfig: OVAL_CONFIG_QUEUE,
      stageBounds,
      prevStageBounds: prevQueueStageBoundsRef.current,
    });
    const queueOrderMap = new Map(djQueueCrewIds.map((crewId, index) => [crewId, index]));
    const sortByQueueOrder = <T extends { crewId: number }>(items: T[]) =>
      items
        .slice()
        .sort(
          (a, b) =>
            (queueOrderMap.get(a.crewId) ?? Number.MAX_SAFE_INTEGER) -
            (queueOrderMap.get(b.crewId) ?? Number.MAX_SAFE_INTEGER)
        );

    queueNodesRef.current = sortByQueueOrder(queueResult.updatedNodes);
    setQueueClustered(sortByQueueOrder(queueResult.positionedCrews));
    prevQueueStageBoundsRef.current = stageBounds;
  }, [crews, djQueueCrewIds, stageBounds]);

  return {
    courtPositions: courtClustered.map(({ crewId, position }) => ({ crewId, position })),
    queuePositions: queueClustered.map(({ crewId, position }) => ({ crewId, position })),
  };
}

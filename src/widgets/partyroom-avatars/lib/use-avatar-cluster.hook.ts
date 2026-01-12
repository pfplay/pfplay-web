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
  OVAL_CONFIG,
} from '../model/constants';

type D3Node = SimulationNodeDatum & Crew.Model & { fx?: number; fy?: number };
type PositionedCrew = Crew.Model & { position: Point };

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

export function useAvatarCluster({ crews }: { crews: Crew.Model[] }): {
  positionedCrews: PositionedCrew[];
} {
  const [clustered, setClustered] = useState<PositionedCrew[]>([]);
  const nodesRef = useRef<D3Node[]>([]); // 현재 노드들 상태 저장

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width * OVAL_CONFIG.CENTER_X_RATIO;
    const centerY = height * OVAL_CONFIG.CENTER_Y_RATIO;

    const existingNodes = nodesRef.current;
    const existingIds = new Set(existingNodes.map((n) => n.crewId));
    const incomingIds = new Set(crews.map((c) => c.crewId));
    const d3Options =
      crews.length > 5 || existingIds.size > 0
        ? D3_OPTIONS_FOR_ADDED_NODES
        : D3_OPTIONS_FOR_INITIAL_NODES;

    const ovalRadiusX = width * OVAL_CONFIG.RADIUS_X_RATIO;
    const ovalRadiusY = height * OVAL_CONFIG.RADIUS_Y_RATIO;

    const boundaryConstraint =
      crews.length > 20 ? 0.8 : crews.length > 10 ? 0.85 : OVAL_CONFIG.BOUNDARY_CONSTRAINT;

    const aspectRatio = ovalRadiusX / ovalRadiusY;
    const forceYStrength = OVAL_CONFIG.FORCE_Y_STRENGTH * (aspectRatio / 1.2);

    const findAvailablePosition = (existingPositions: Point[]): Point => {
      const minDistance = d3Options.MIN_DISTANCE;
      const maxAttempts = d3Options.MAX_ATTEMPTS;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const radiusRatio = Math.sqrt(Math.random()); // 랜덤 위치 생성
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
        OVAL_CONFIG.FALLBACK_RADIUS_RATIO
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
        ...updatedCrew, // 새로운 속성들 (아바타, 닉네임 등)
        x: n.x, // 기존 위치 유지
        y: n.y,
        fx: n.x, // 위치 고정
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

    nodesRef.current = updatedNodes;

    const ellipseBoundary = () => {
      updatedNodes.forEach((node) => {
        constrainToEllipse(node, centerX, centerY, ovalRadiusX, ovalRadiusY, boundaryConstraint);
      });
    };

    const simulation = forceSimulation(updatedNodes)
      .force('x', forceX(centerX).strength(OVAL_CONFIG.FORCE_X_STRENGTH))
      .force('y', forceY(centerY).strength(forceYStrength))
      .force('charge', forceManyBody().strength(d3Options.FORCE_STRENGTH))
      .force('collision', forceCollide().radius(d3Options.COLLIDE_RADIUS))
      .force('ellipse', ellipseBoundary)
      .stop();

    const tickCount =
      updatedNodes.length > 20 ? OVAL_CONFIG.SIMULATION_TICKS * 1.5 : OVAL_CONFIG.SIMULATION_TICKS;

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

    setClustered(
      updatedNodes.map((n) => ({
        ...n,
        position: {
          x: Math.round(n.x ?? centerX),
          y: Math.round(n.y ?? centerY),
        },
      }))
    );

    return () => {
      simulation.stop();
    };
  }, [crews]);

  return {
    positionedCrews: clustered,
  };
}

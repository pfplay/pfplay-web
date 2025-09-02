import { useEffect, useState, useRef } from 'react';
import {
  forceSimulation,
  forceCenter,
  forceManyBody,
  forceCollide,
  SimulationNodeDatum,
  Simulation,
} from 'd3-force';
import { Crew } from '@/entities/current-partyroom';
import { Point } from '../model/avatar-position.model';
import { AVATAR_GROUP } from '../model/constants';

type D3Node = SimulationNodeDatum & Crew.Model & { fx?: number; fy?: number };
type PositionedCrew = Crew.Model & { position: Point };

export function useAvatarCluster({ crews }: { crews: Crew.Model[] }): PositionedCrew[] {
  const [clustered, setClustered] = useState<PositionedCrew[]>([]);
  const simulationRef = useRef<Simulation<D3Node, undefined> | null>(null); // 노드 간 물리적인 힘 계산을 위한 참조
  const nodesRef = useRef<D3Node[]>([]); // 현재 노드들 상태 저장

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width * 0.6;
    const centerY = height * 0.8;

    const existingNodes = nodesRef.current;
    const existingIds = new Set(existingNodes.map((n) => n.crewId));
    const incomingIds = new Set(crews.map((c) => c.crewId));

    const findAvailablePosition = (
      existingPositions: { x: number; y: number }[]
    ): { x: number; y: number } => {
      const minDistance = AVATAR_GROUP.COLLISION_RADIUS * 1.5; // 최소 거리 (최초 접근 시와 동일한 간격)
      const maxAttempts = 100;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = centerX + (Math.random() - 0.5) * AVATAR_GROUP.WIDTH;
        const y = centerY + (Math.random() - 0.5) * AVATAR_GROUP.HEIGHT;

        // 기존 노드들과의 거리 확인
        const isAvailable = existingPositions.every((pos) => {
          const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          return distance >= minDistance;
        });

        if (isAvailable) {
          return { x, y };
        }
      }

      // 모든 시도가 실패하면 중앙점에서 멀리 떨어진 위치 반환
      return {
        x: centerX + (Math.random() - 0.5) * width * 0.4,
        y: centerY + (Math.random() - 0.5) * height * 0.4,
      };
    };

    // 유지되는 기존 노드는 fx, fy로 고정
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

    // 추가된 노드를 기존 노드들과 충돌하지 않는 위치에 배치함
    const addedNodes: D3Node[] = crews
      .filter((c) => !existingIds.has(c.crewId))
      .map((crew) => {
        const position = findAvailablePosition(existingPositions);
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

    // D3 Simulation 실행
    if (!simulationRef.current) {
      // 있는 경우 재사용
      simulationRef.current = forceSimulation(updatedNodes)
        .force('center', forceCenter(centerX, centerY))
        .force('charge', forceManyBody().strength(-10))
        .force('collision', forceCollide().radius(AVATAR_GROUP.COLLISION_RADIUS))
        .stop();
    } else {
      simulationRef.current.nodes(updatedNodes).alpha(1).restart();
    }

    for (let i = 0; i < 100; i++) {
      // simulationRef 힘 계산을 충분히 하도록 100번 반복 (최초 접근 시와 동일)
      simulationRef.current?.tick();
    }

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
      simulationRef.current?.stop();
    };
  }, [crews]);

  return clustered;
}

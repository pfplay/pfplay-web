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

    // 추가된 노드 (아바타)
    const addedNodes: D3Node[] = crews
      .filter((c) => !existingIds.has(c.crewId))
      .map((crew) => ({
        ...crew,
        x: centerX + (Math.random() - 0.5) * AVATAR_GROUP.WIDTH,
        y: centerY + (Math.random() - 0.5) * AVATAR_GROUP.HEIGHT,
      }));

    // 유지되는 기존 노드는 fx, fy로 고정
    const keptNodes = existingNodes.map((n) =>
      incomingIds.has(n.crewId) ? { ...n, fx: n.x, fy: n.y } : n
    );

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
        .force('center', forceCenter(centerX, centerY)) // 중앙에 가까워지도록
        .force('charge', forceManyBody().strength(-10)) // 서로 밀치는 힘
        .force('collision', forceCollide().radius(AVATAR_GROUP.COLLISION_RADIUS)) // 5px 간격
        .stop();
    } else {
      simulationRef.current.nodes(updatedNodes).alpha(1).restart();
    }

    for (let i = 0; i < 100; i++) {
      // simulationRef 힘 계산을 충분히 하도록 100번 반복
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

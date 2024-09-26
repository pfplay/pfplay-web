import { useEffect, useState } from 'react';
import { Crew } from '@/entities/current-partyroom';
import { Area, getRandomPoint, Point } from '../model/avatar-position.model';

type Props = {
  originCrews: Crew.Model[];
  allowArea: Area;
  denyArea: Area;
};

type PositionedCrew = Crew.Model & { position: Point };

export default function useAssignAvatarPositions({
  originCrews,
  allowArea,
  denyArea,
}: Props): PositionedCrew[] {
  const [positionedCrews, setPositionedCrews] = useState<PositionedCrew[]>(
    originCrews.map((crew) => assignPositionToCrew(crew, allowArea, denyArea))
  );

  useEffect(() => {
    const { added, removed } = diffCrews(positionedCrews, originCrews);

    if (added.length) {
      const newCrews = added.map((crew) => assignPositionToCrew(crew, allowArea, denyArea));

      setPositionedCrews((prev) => [...prev, ...newCrews]);
    }

    if (removed.length) {
      setPositionedCrews((prev) =>
        prev.filter((crew) => !removed.some((removedCrew) => removedCrew.uid === crew.uid))
      );
    }
  }, [originCrews]);

  return positionedCrews;
}

function assignPositionToCrew(crew: Crew.Model, allowArea: Area, denyArea: Area): PositionedCrew {
  const position = getRandomPoint(allowArea, denyArea);

  return { ...crew, position };
}

function diffCrews(
  prevCrews: Crew.Model[],
  nextCrews: Crew.Model[]
): { added: Crew.Model[]; removed: Crew.Model[] } {
  const prevCrewSet = new Set(prevCrews.map((crew) => crew.uid));
  const nextCrewSet = new Set(nextCrews.map((crew) => crew.uid));

  const added = nextCrews.filter((crew) => !prevCrewSet.has(crew.uid));
  const removed = prevCrews.filter((crew) => !nextCrewSet.has(crew.uid));

  return { added, removed };
}

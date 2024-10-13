import { useEffect, useState } from 'react';
import { Crew } from '@/entities/current-partyroom';
import { deepEqual } from '@/shared/lib/functions/deep-equal';
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

    if (added.length || removed.length) {
      if (added.length) {
        const newCrews = added.map((crew) => assignPositionToCrew(crew, allowArea, denyArea));

        setPositionedCrews((prev) => [...prev, ...newCrews]);
      }

      if (removed.length) {
        setPositionedCrews((prev) =>
          prev.filter((crew) => !removed.some((removedCrew) => removedCrew.crewId === crew.crewId))
        );
      }

      return;
    }

    const { modified } = deepDiffCrews(positionedCrews, originCrews);

    if (modified.length) {
      const modifiedCrewMap = new Map(modified.map((crew) => [crew.crewId, crew]));

      setPositionedCrews((prev) =>
        prev.map((prevPositionedCrew) => {
          const modifiedCrew = modifiedCrewMap.get(prevPositionedCrew.crewId);

          if (!modifiedCrew) {
            return prevPositionedCrew;
          }

          return {
            ...modifiedCrew,
            position: prevPositionedCrew.position,
          };
        })
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
  const prevCrewSet = new Set(prevCrews.map((crew) => crew.crewId));
  const nextCrewSet = new Set(nextCrews.map((crew) => crew.crewId));

  return {
    added: nextCrews.filter((crew) => !prevCrewSet.has(crew.crewId)),
    removed: prevCrews.filter((crew) => !nextCrewSet.has(crew.crewId)),
  };
}

function deepDiffCrews(
  prevCrews: Crew.Model[],
  nextCrews: Crew.Model[]
): { modified: Crew.Model[] } {
  const prevCrewMap = new Map(prevCrews.map((crew) => [crew.crewId, crew]));

  return {
    modified: nextCrews.filter((crew) => {
      const prevCrew = prevCrewMap.get(crew.crewId);

      return prevCrew && !deepEqual(prevCrew, crew);
    }),
  };
}

import { useMemo } from 'react';
import useFetchMyBlockedCrews from '../api/use-fetch-my-blocked-crews.query';

export default function useIsBlockedCrew() {
  const { data: blockedCrews = [] } = useFetchMyBlockedCrews();

  const blockedCrewsSet = useMemo<Set<number>>(() => {
    return new Set(blockedCrews.map((crew) => crew.blockedCrewId));
  }, [blockedCrews]);

  return (crewId: number) => {
    return blockedCrewsSet.has(crewId);
  };
}

import { useMemo } from 'react';
import { useStores } from '@/shared/lib/store/stores.context';
import useFetchMyBlockedCrews from '../api/use-fetch-my-blocked-crews.query';

export default function useIsBlockedCrew() {
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);
  const { data: blockedCrews = [] } = useFetchMyBlockedCrews(!!partyroomId);

  const blockedCrewsSet = useMemo<Set<number>>(() => {
    return new Set(blockedCrews.map((crew) => crew.blockedCrewId));
  }, [blockedCrews]);

  return (crewId: number) => {
    return blockedCrewsSet.has(crewId);
  };
}

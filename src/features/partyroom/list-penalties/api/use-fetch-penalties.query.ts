import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { Penalty } from '@/shared/api/http/types/partyrooms';
import { FIVE_MINUTES } from '@/shared/config/time';
import { useStores } from '@/shared/lib/store/stores.context';
import canViewPenalties from './use-can-view-penalties.hook';

export default function useFetchPenalties() {
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);
  const canView = canViewPenalties();

  return useQuery<Penalty[], AxiosError<APIError>>({
    queryKey: [QueryKeys.Penalties, partyroomId],
    queryFn: () => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      return partyroomsService.getPenaltyList({ partyroomId });
    },
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    initialData: [],
    enabled: canView,
  });
}

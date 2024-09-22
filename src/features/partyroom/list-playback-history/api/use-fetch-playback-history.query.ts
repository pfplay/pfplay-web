import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { PlaybackHistoryItem } from '@/shared/api/http/types/partyrooms';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useFetchPlaybackHistory() {
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return useQuery<PlaybackHistoryItem[], AxiosError<APIError>>({
    queryKey: [QueryKeys.PlaybackHistory, partyroomId],
    queryFn: () => {
      if (!partyroomId) {
        throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
      }
      return PartyroomsService.getPlaybackHistory({ partyroomId });
    },
  });
}

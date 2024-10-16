import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { GetDjingQueuePayload, DjingQueue } from '@/shared/api/http/types/partyrooms';
import { FIVE_MINUTES } from '@/shared/config/time';

export default function useFetchDjingQueue(payload: GetDjingQueuePayload, enabled?: boolean) {
  return useQuery<DjingQueue, AxiosError<APIError>>({
    queryKey: [QueryKeys.DjingQueue, payload.partyroomId],
    queryFn: () => PartyroomsService.getDjingQueue(payload),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    enabled,
  });
}

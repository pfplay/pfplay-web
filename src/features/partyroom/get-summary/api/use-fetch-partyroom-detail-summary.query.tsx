import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { PartyroomDetailSummary } from '@/shared/api/http/types/partyrooms';
import { FIVE_MINUTES } from '@/shared/config/time';

export default function useFetchPartyroomDetailSummary(partyroomId: number) {
  return useQuery<PartyroomDetailSummary, AxiosError<APIError>>({
    queryKey: [QueryKeys.PartyroomDetailSummary, partyroomId],
    queryFn: () => PartyroomsService.getPartyroomDetailSummary({ partyroomId }),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    refetchOnWindowFocus: true,
  });
}

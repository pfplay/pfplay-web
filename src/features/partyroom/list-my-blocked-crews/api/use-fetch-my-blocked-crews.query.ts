import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { crewsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { BlockedCrew } from '@/shared/api/http/types/crews';
import { FIVE_MINUTES } from '@/shared/config/time';

export default function useFetchMyBlockedCrews(enabled = true) {
  return useQuery<BlockedCrew[], AxiosError<APIError>>({
    queryKey: [QueryKeys.MyBlocks],
    queryFn: () => crewsService.getBlockedCrews(),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    enabled,
  });
}

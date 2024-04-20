import { QueryKey } from '@tanstack/query-core';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { PartiesService } from '@/shared/api/services/parties';
import { APIError, PaginationPayload, PaginationResponse } from '@/shared/api/types/@shared';
import { PartyRoomSummary } from '@/shared/api/types/parties';
import { ONE_HOUR } from '@/shared/config/time';
import { PARTY_ROOMS_QUERY_KEY } from './keys';

export const useSuspenseFetchPartyRooms = (initialPagePayload: PaginationPayload) => {
  return useSuspenseInfiniteQuery<
    PaginationResponse<PartyRoomSummary>,
    AxiosError<APIError>,
    PartyRoomSummary[],
    QueryKey,
    PaginationPayload
  >({
    queryKey: [PARTY_ROOMS_QUERY_KEY],
    queryFn: ({ pageParam }) => PartiesService.getList(pageParam),
    initialPageParam: initialPagePayload,
    getNextPageParam: ({ pagination }) => {
      if (!pagination.hasNext) {
        return;
      }
      return {
        page: pagination.pageNumber + 1,
        size: pagination.pageSize,
      };
    },
    select: (data) => {
      return data.pages.flatMap((page) => page.content);
    },
    staleTime: ONE_HOUR,
    gcTime: Infinity,
  });
};

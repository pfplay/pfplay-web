import { QueryKey } from '@tanstack/query-core';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { APIError, PaginationPayload, PaginationResponse } from '@/api/@types/@shared';
import { PartyRoomSummary } from '@/api/@types/Parties';
import { PartiesService } from '@/api/services/Parties';
import { ONE_HOUR } from '@/constants/time';
import { PARTY_ROOMS_QUERY_KEY } from './keys';

export const usePartyRoomsSuspenseQuery = (initialPagePayload: PaginationPayload) => {
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

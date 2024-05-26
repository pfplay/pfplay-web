import { QueryKey } from '@tanstack/query-core';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { PartiesService } from '@/shared/api/services/parties';
import { APIError, PaginationPayload, PaginationResponse } from '@/shared/api/types/@shared';
import { PartyroomSummary } from '@/shared/api/types/parties';
import { ONE_HOUR } from '@/shared/config/time';

export const useSuspenseFetchPartyrooms = (initialPagePayload: PaginationPayload) => {
  return useSuspenseInfiniteQuery<
    PaginationResponse<PartyroomSummary>,
    AxiosError<APIError>,
    PartyroomSummary[],
    QueryKey,
    PaginationPayload
  >({
    queryKey: [QueryKeys.PartyroomList],
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

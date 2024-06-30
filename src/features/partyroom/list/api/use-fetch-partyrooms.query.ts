import { QueryKey } from '@tanstack/query-core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { PartiesService } from '@/shared/api/http/services/parties';
import { APIError, PaginationPayload, PaginationResponse } from '@/shared/api/http/types/@shared';
import { PartyroomSummary } from '@/shared/api/http/types/parties';
import { ONE_HOUR } from '@/shared/config/time';

export const useFetchPartyrooms = (initialPagePayload: PaginationPayload) => {
  return useInfiniteQuery<
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
        pageNumber: pagination.pageNumber + 1,
        pageSize: pagination.pageSize,
      };
    },
    select: (data) => {
      return data.pages.flatMap((page) => page.content);
    },
    staleTime: ONE_HOUR,
    gcTime: Infinity,
  });
};

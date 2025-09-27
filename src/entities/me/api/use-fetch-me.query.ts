import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
  useSuspenseQuery,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query/src/types';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { ONE_HOUR } from '@/shared/config/time';
import * as Me from '../model/me.model';

export function useFetchMe(
  options?: Partial<UseQueryOptions<Me.Model, AxiosError<APIError>>>
): UseQueryResult<Me.Model, AxiosError<APIError>> {
  return useQuery({ ...queryOptions, ...options });
}

export function useSuspenseFetchMe(): UseSuspenseQueryResult<Me.Model, AxiosError<APIError>> {
  return useSuspenseQuery(queryOptions);
}

export const queryOptions: UseQueryOptions<Me.Model, AxiosError<APIError>> = {
  queryKey: [QueryKeys.Me],
  queryFn: async () => {
    const meInfo = await usersService.getMyInfo();
    const meProfileSummary = await usersService.getMyProfileSummary();

    return {
      ...meInfo,
      ...meProfileSummary,
    };
  },
  staleTime: ONE_HOUR,
  gcTime: ONE_HOUR,
  placeholderData: keepPreviousData,
};

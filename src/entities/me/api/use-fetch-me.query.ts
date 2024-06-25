import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query/src/types';
import { AxiosError } from 'axios';
import { Me } from '@/entities/me/model/me.model';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UsersService } from '@/shared/api/services/users';
import { APIError } from '@/shared/api/types/@shared';
import { ONE_HOUR } from '@/shared/config/time';

export function useFetchMe(): UseQueryResult<Me, AxiosError<APIError>> {
  return useQuery(queryOptions);
}

export const queryOptions: UseQueryOptions<Me, AxiosError<APIError>> = {
  queryKey: [QueryKeys.Me],
  queryFn: async () => {
    const meInfo = await UsersService.getMyInfo();
    const meProfileSummary = await UsersService.getMyProfileSummary();

    return {
      ...meInfo,
      ...meProfileSummary,
    };
  },
  staleTime: ONE_HOUR,
  gcTime: ONE_HOUR,
};

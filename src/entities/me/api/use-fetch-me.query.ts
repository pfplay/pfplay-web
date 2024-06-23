import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query/src/types';
import { Me } from '@/entities/me/model/me.model';
import { QueryKeys } from '@/shared/api/react-query/keys';
import { UsersService } from '@/shared/api/services/users';
import { ONE_HOUR } from '@/shared/config/time';

export function useSuspenseFetchMe() {
  return useSuspenseQuery<Me>(queryOptions);
}

export function useFetchMe() {
  return useQuery<Me>(queryOptions);
}

export const queryOptions: UseQueryOptions<Me> = {
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

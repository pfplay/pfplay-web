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

export function useFetchMe(): UseQueryResult<Me.Model, AxiosError<APIError>> {
  return useQuery(queryOptions);
}

export function useSuspenseFetchMe(): UseSuspenseQueryResult<Me.Model, AxiosError<APIError>> {
  return useSuspenseQuery(queryOptions);
}

export const queryOptions: UseQueryOptions<Me.Model, AxiosError<APIError>> = {
  queryKey: [QueryKeys.Me],
  queryFn: async () => {
    // 동시 발사 — 두 endpoint 가 항상 같은 cookie/session 으로 호출됨을 보장.
    // 순차 await 면 token 변경 시점(login/logout/promote)에 info=GUEST cookie,
    // summary=새 cookie 로 갈려 spread merge 가 하이브리드 좀비 me 를 만든다.
    // Promise.all 이 그 race window 자체를 영구히 닫는다 (옵션 5a, #7).
    const [meInfo, meProfileSummary] = await Promise.all([
      usersService.getMyInfo(),
      usersService.getMyProfileSummary(),
    ]);

    return {
      ...meInfo,
      ...meProfileSummary,
    };
  },
  staleTime: ONE_HOUR,
  gcTime: ONE_HOUR,
  placeholderData: keepPreviousData,
};

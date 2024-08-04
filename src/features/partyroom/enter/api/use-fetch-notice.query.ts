import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { APIError } from '@/shared/api/http/types/@shared';
import { GetNoticeResponse } from '@/shared/api/http/types/partyrooms';

/**
 * 공지사항은 현재 설계상 enter 시점엔 rest api로 받아오고,
 * 이후 공지 변경이 있을 땐 웹 소켓 이벤트로 수신합니다.
 * 때문에 rest api에 대해선 useQuery를 사용하지 않고 fetchQuery를 사용하여, enter 시점 최초 1회만 호출합니다.
 */
export function useFetchNoticeAsync() {
  const queryClient = useQueryClient();

  return useCallback(
    async (partyroomId: number) => {
      const { content } = await queryClient.fetchQuery<GetNoticeResponse, AxiosError<APIError>>({
        queryKey: [QueryKeys.Notice, partyroomId],
        queryFn: () => PartyroomsService.getNotice({ partyroomId }),
      });

      return content ?? '';
    },
    [queryClient]
  );
}

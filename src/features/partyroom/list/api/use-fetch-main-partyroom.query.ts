import { useSuspenseQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { StageType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { FIVE_MINUTES, ONE_SECOND } from '@/shared/config/time';

export const useSuspenseFetchMainPartyroom = () => {
  return useSuspenseQuery<PartyroomSummary[], AxiosError<APIError>, PartyroomSummary>({
    queryKey: [QueryKeys.PartyroomList],
    queryFn: PartyroomsService.getList,
    select: (data) => {
      // NOTE: 메인 파티룸은 항상 존재한다고 가정
      return data.find((partyroom) => partyroom.stageType === StageType.MAIN) as PartyroomSummary;
    },
    staleTime: 10 * ONE_SECOND,
    gcTime: FIVE_MINUTES,
  });
};

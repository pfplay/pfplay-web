import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { StageType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { FIVE_MINUTES, ONE_SECOND } from '@/shared/config/time';

export const useFetchGeneralPartyrooms = () => {
  return useQuery<PartyroomSummary[], AxiosError<APIError>, PartyroomSummary[]>({
    queryKey: [QueryKeys.PartyroomList],
    queryFn: PartyroomsService.getList,
    select: (data) => data.filter((partyroom) => partyroom.stageType === StageType.GENERAL),
    staleTime: 10 * ONE_SECOND,
    gcTime: FIVE_MINUTES,
  });
};

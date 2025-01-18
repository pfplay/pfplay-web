import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { StageType } from '@/shared/api/http/types/@enums';
import { APIError } from '@/shared/api/http/types/@shared';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { FIVE_MINUTES } from '@/shared/config/time';

export const useFetchGeneralPartyrooms = () => {
  return useQuery<PartyroomSummary[], AxiosError<APIError>, PartyroomSummary[]>({
    queryKey: [QueryKeys.PartyroomList],
    queryFn: () => partyroomsService.getList(),
    select: (data) => data.filter((partyroom) => partyroom.stageType === StageType.GENERAL),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    refetchOnWindowFocus: true,
  });
};

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { crewsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { CrewProfile } from '@/shared/api/http/types/crews';
import { FIVE_MINUTES } from '@/shared/config/time';

export default function useViewCrewProfile(crewId: number) {
  return useQuery<CrewProfile, AxiosError<APIError>>({
    queryKey: [QueryKeys.CrewProfile, crewId],
    queryFn: () => crewsService.getCrewProfile({ crewId }),
    staleTime: 0,
    gcTime: FIVE_MINUTES,
    refetchOnWindowFocus: true,
    enabled: !!crewId,
  });
}

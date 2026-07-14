import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { crewsService } from '@/shared/api/http/services';

/**
 * 다른 crew 의 프로필(닉네임·소개·아바타·활동 점수) 조회 (#409).
 * 백엔드 GET /v1/partyrooms/crews/{crewId}/profile/summary 를 그대로 사용.
 */
export function useViewCrewProfile(crewId: number) {
  return useQuery({
    queryKey: [QueryKeys.Crews, crewId, 'profile'],
    queryFn: () => crewsService.getCrewProfileSummary({ crewId }),
    staleTime: 60_000,
  });
}

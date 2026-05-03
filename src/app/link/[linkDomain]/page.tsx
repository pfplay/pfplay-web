'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { GetPartyroomByLinkResponse } from '@/shared/api/http/types/partyrooms';

/**
 * SharedLinkPage 컴포넌트
 *
 * 공유 링크를 통해 파티룸에 입장할 때 사용됩니다.
 * 1. getPartyroomByLink로 파티룸 정보를 조회합니다. (GET, 부작용 없음)
 * 2. 조회된 partyroomId로 파티룸 페이지로 이동합니다.
 * 3. 게스트 인증은 파티룸 페이지의 useAutoSignIn에서 처리합니다.
 */
export default function LinkPage() {
  const { linkDomain } = useParams<{ linkDomain: string }>();
  const router = useRouter();

  const { mutate: getPartyroom } = useMutation<
    GetPartyroomByLinkResponse,
    AxiosError<APIError>,
    string
  >({
    mutationFn: (domain) => partyroomsService.getPartyroomByLink({ linkDomain: domain }),
  });

  useEffect(() => {
    if (linkDomain) {
      getPartyroom(linkDomain, {
        onSuccess: ({ partyroomId }) => {
          router.push(`/parties/${partyroomId}?source=link`);
        },
      });
    }
  }, [linkDomain, getPartyroom, router]);

  // TODO: 로딩 디자인 적용
  return <div>Loading...</div>;
}

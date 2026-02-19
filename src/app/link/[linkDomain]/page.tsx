'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { partyroomsService } from '@/shared/api/http/services';
import { APIError } from '@/shared/api/http/types/@shared';
import { EnterByLinkResponse } from '@/shared/api/http/types/partyrooms';

/**
 * SharedLinkPage 컴포넌트
 *
 * 이 컴포넌트는 공유 링크를 통해 파티룸에 입장할 때 사용됩니다.
 * 주요 기능:
 * 1. URL 파라미터로 받은 도메인을 사용하여 파티룸 입장을 시도합니다.
 * 2. 에러 발생 시 Error 객체를 throw하여 Next.js의 error.tsx에서 처리하도록 합니다.
 * 3. 파티룸 입장 처리 중에는 로딩 디자인을 렌더링합니다.
 *
 */
export default function LinkPage() {
  const { linkDomain } = useParams<{ linkDomain: string }>();
  const router = useRouter();

  const { mutate: enterByLink } = useMutation<EnterByLinkResponse, AxiosError<APIError>, string>({
    mutationFn: (domain) => partyroomsService.enterByLink({ linkDomain: domain }),
  });

  useEffect(() => {
    if (linkDomain) {
      enterByLink(linkDomain, {
        onSuccess: ({ partyroomId }) => {
          router.push(`/parties/${partyroomId}`);
        },
      });
    }
  }, [linkDomain, enterByLink, router]);

  // TODO: 로딩 디자인 적용
  return <div>Loading...</div>;
}

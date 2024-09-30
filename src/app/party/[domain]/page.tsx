'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGetPartyroomIdByDomain } from '@/features/share-link';

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
export default function SharedLinkPage() {
  const { domain } = useParams<{ domain: string }>();
  const router = useRouter();

  const { mutate: getPartyroomIdByDomain } = useGetPartyroomIdByDomain();

  useEffect(() => {
    if (domain) {
      getPartyroomIdByDomain(
        { domain },
        {
          onSuccess: (response) => {
            const { partyroomId } = response;

            router.push(`/parties/${partyroomId}`);
          },
          // NOTE: partyroomId 없을 때 서버에서 404 에러 발생하면 react-query-provider에서 처리
        }
      );
    }
  }, [domain, router, getPartyroomIdByDomain]);

  // TODO: 로딩 디자인 적용: (https://www.figma.com/design/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?node-id=3019-29522&t=jwbleGJOLe2EfWEW-4)
  return <div>Loading...</div>;
}

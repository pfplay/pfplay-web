'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import { ApiStatus } from '@/shared/api/http/types/@shared';

export default function SharedLinkPage() {
  const { domain } = useParams<{ domain: string }>();
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');

  useEffect(() => {
    const enterBySharedLink = async () => {
      if (!domain) {
        throw new Error('Domain is not provided.');
      }

      try {
        setApiStatus('loading');
        const response = await PartyroomsService.enterBySharedLink({ domain });
        const { partyroomId } = response;

        if (!partyroomId) {
          throw new Error('Partyroom not found.');
        }

        router.push(`/parties/${partyroomId}`);
        setApiStatus('success');
      } catch (error) {
        console.error('Error occurred while entering the party room:', error);
        setApiStatus('error');
      }
    };

    enterBySharedLink();
  }, [domain, router]);

  if (apiStatus === 'loading') {
    // TODO: 로딩 디자인 추가: https://www.figma.com/design/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?node-id=3019-29522&t=jwbleGJOLe2EfWEW-4
    return <div>Loading...</div>;
  }

  if (apiStatus === 'error') {
    // TODO: 에러 모달 추가 후 redirection: https://www.figma.com/design/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?node-id=3019-29763&t=jwbleGJOLe2EfWEW-4
    return <div>Error occurred while entering the party room.</div>;
  }

  return <div>{domain}</div>;
}

'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGetPartyroomIdByDomain } from '@/features/share-link';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useDialog } from '@/shared/ui/components/dialog';

const logger = withDebugger(0);
const errorLogger = logger(errorLog);
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
  const { openErrorDialog } = useDialog();

  const { mutate: getPartyroomIdByDomain } = useGetPartyroomIdByDomain();

  useEffect(() => {
    const enterBySharedLink = async () => {
      if (!domain) {
        throw new Error('Domain is not provided.');
      }

      getPartyroomIdByDomain(
        { domain },
        {
          onSuccess: (response) => {
            const { partyroomId } = response;

            if (!partyroomId) {
              throw new Error('Partyroom not found.'); // TODO: i18n 적용
            }

            router.push(`/parties/${partyroomId}`);
          },
          onError: (error) => {
            errorLogger(error);
            openErrorDialog(
              error.message || 'An error occurred while entering the party room. Please try again.' // TODO: i18n 적용
            );
          },
        }
      );
    };

    enterBySharedLink();
  }, [domain, router, getPartyroomIdByDomain, openErrorDialog]);

  // TODO: 로딩 디자인 적용: (https://www.figma.com/design/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?node-id=3019-29522&t=jwbleGJOLe2EfWEW-4)
  return <div>Loading...</div>;
}

'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { useEnterPartyroom } from '@/features/partyroom/enter';
import { useExitPartyroom } from '@/features/partyroom/exit';
import { parseEntrySource } from '@/shared/lib/analytics/room-tracking';
import useDidMountEffect from '@/shared/lib/hooks/use-did-mount-effect';

export default function PartyroomLayout({ children }: PropsWithChildren) {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const partyroomId = Number(params.id);
  const entrySource = parseEntrySource(searchParams.get('source'));
  const enter = useEnterPartyroom(partyroomId, { entrySource });
  const exit = useExitPartyroom(partyroomId);

  useDidMountEffect(() => {
    enter();

    // `?source=` 는 진입 attribution 1회 분류용이므로 즉시 제거.
    // 그대로 두면 사용자가 URL을 복사/공유할 때 잘못된 entry_source가 전파됨.
    if (searchParams.get('source')) {
      router.replace(`/parties/${params.id}`, { scroll: false });
    }

    window.addEventListener('beforeunload', exit);

    return () => {
      exit();

      window.removeEventListener('beforeunload', exit);
    };
  });

  return <main className='bg-partyRoom bg-left-bottom overflow-hidden'>{children}</main>;
}

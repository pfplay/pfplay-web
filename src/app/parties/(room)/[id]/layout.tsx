'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { useEnterPartyroom } from '@/features/partyroom/enter';
import { useExitPartyroom } from '@/features/partyroom/exit';
import { parseEntrySource } from '@/shared/lib/analytics/room-tracking';
import useDidMountEffect from '@/shared/lib/hooks/use-did-mount-effect';

export default function PartyroomLayout({ children }: PropsWithChildren) {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const partyroomId = Number(params.id);
  const entrySource = parseEntrySource(searchParams.get('source'));
  const enter = useEnterPartyroom(partyroomId, { entrySource });
  const exit = useExitPartyroom(partyroomId);

  useDidMountEffect(() => {
    enter();

    window.addEventListener('beforeunload', exit);

    return () => {
      exit();

      window.removeEventListener('beforeunload', exit);
    };
  });

  return <main className='bg-partyRoom bg-left-bottom overflow-hidden'>{children}</main>;
}

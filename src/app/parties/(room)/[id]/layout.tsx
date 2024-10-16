'use client';

import { useParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { useEnterPartyroom } from '@/features/partyroom/enter';
import { useExitPartyroom } from '@/features/partyroom/exit';
import useDidMountEffect from '@/shared/lib/hooks/use-did-mount-effect';

export default function PartyroomLayout({ children }: PropsWithChildren) {
  const params = useParams<{ id: string }>();
  const partyroomId = Number(params.id);
  const enter = useEnterPartyroom(partyroomId);
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

'use client';

import { useParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { isPartyroomSubscription } from '@/entities/current-partyroom';
import { usePartyroomClient } from '@/entities/partyroom-client';
import { useEnterPartyroom } from '@/features/partyroom/enter';
import { useExitPartyroom } from '@/features/partyroom/exit';
import useDidUpdateEffect from '@/shared/lib/hooks/use-did-update-effect';

export default function PartyroomLayout({ children }: PropsWithChildren) {
  const params = useParams<{ id: string }>();
  const partyroomId = Number(params.id);
  const client = usePartyroomClient();
  const { mutate: enter } = useEnterPartyroom();
  const { mutate: exit } = useExitPartyroom();

  useDidUpdateEffect(() => {
    if (client.subscriptions.some(isPartyroomSubscription)) {
      // TODO: 다른 방 연결 끊고 이 방에 연결할래? 라는 문구 출력
      return;
    }

    client.registerConnectListener(() => {
      enter({ partyroomId });
    });

    return () => {
      exit({ partyroomId });
    };
  }, []);

  return <main className='bg-partyRoom overflow-hidden'>{children}</main>;
}

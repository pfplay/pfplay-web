'use client';

import { useParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import {
  getPartyroomDestination,
  handlePartyroomSubscriptionEvent,
  isPartyroomSubscription,
} from '@/entities/current-partyroom';
import { usePartyroomClient } from '@/entities/partyroom-client';
import { useEnterPartyroom } from '@/features/partyroom/enter';
import { useExitPartyroom } from '@/features/partyroom/exit';
import useDidMountEffect from '@/shared/lib/hooks/use-did-mount-effect';

const PartyroomLayout = ({ children }: PropsWithChildren) => {
  const params = useParams<{ id: string }>();
  const partyroomId = Number(params.id);
  const client = usePartyroomClient();
  const { mutate: enter } = useEnterPartyroom();
  const { mutate: exit } = useExitPartyroom();

  useDidMountEffect(() => {
    if (client.subscriptions.some(isPartyroomSubscription)) {
      // TODO: 다른 방 연결 끊고 이 방에 연결할래? 라는 문구 출력
      return;
    }

    client.registerConnectListener(() => {
      enter(
        { partyroomId },
        {
          onSuccess: () => {
            client.subscribe(getPartyroomDestination(params.id), handlePartyroomSubscriptionEvent);
          },
        }
      );
    });

    return () => {
      exit(
        { partyroomId },
        {
          onSuccess: () => {
            client.unsubscribeAll();
          },
        }
      );
    };
  }, []);

  return <main className='bg-partyRoom overflow-hidden'>{children}</main>;
};

export default PartyroomLayout;

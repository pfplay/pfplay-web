'use client';

import { useParams } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { usePartyroomClient } from '@/entities/partyroom-client';

const PartyroomLayout = ({ children }: PropsWithChildren) => {
  const params = useParams<{ id: string }>();
  const client = usePartyroomClient();

  useEffect(() => {
    if (client.hasSubscription) {
      // TODO: 다른 방 연결 끊고 이 방에 연결할래? 라는 문구 출력
      return;
    }

    client.registerConnectListener(() => {
      client.subscribe(`sub/partyrooms/${params.id}`, (message) => {
        console.log(JSON.stringify(message)); // TODO: 메세지 핸들링
      });
    });

    return () => {
      client.unsubscribeAll();
    };
  }, []);

  return (
    <>
      <main className='bg-partyRoom'>{children}</main>
    </>
  );
};

export default PartyroomLayout;

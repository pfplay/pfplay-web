'use client';

import { useParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { usePartyroomClient } from '@/entities/partyroom-client';
import PartyroomsService from '@/shared/api/http/services/partyrooms';
import useDidMountEffect from '@/shared/lib/hooks/use-did-mount-effect';

const PartyroomLayout = ({ children }: PropsWithChildren) => {
  const params = useParams<{ id: string }>();
  const client = usePartyroomClient();

  useDidMountEffect(() => {
    if (client.subscriptions.some(({ destination }) => destination.startsWith(`sub/partyrooms/`))) {
      // TODO: 다른 방 연결 끊고 이 방에 연결할래? 라는 문구 출력
      return;
    }

    client.registerConnectListener(async () => {
      await PartyroomsService.enter({
        // TODO: mutation으로 변환하고 feature로 이동
        partyroomId: Number(params.id),
      });

      client.subscribe(`/sub/partyrooms/${params.id}`, (message) => {
        console.log(JSON.stringify(message)); // TODO: 메세지 핸들링
      });
    });

    return () => {
      client.unsubscribeAll();

      PartyroomsService.exit({
        // TODO: mutation으로 변환하고 feature로 이동, 파티룸 관련 쿼리들 전부 invalidate 해야함
        partyroomId: Number(params.id),
      });
    };
  }, []);

  return <main className='bg-partyRoom overflow-hidden'>{children}</main>;
};

export default PartyroomLayout;

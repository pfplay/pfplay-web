'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useFetchMe } from '@/entities/me';
import { PartyroomConnectionContext } from '@/entities/partyroom-connection';
import StompClient from '@/shared/api/websocket/client';

export default function PartyroomConnectionProvider({ children }: { children: ReactNode }) {
  const { data: me } = useFetchMe();
  const [client] = useState(() => new StompClient());

  useEffect(() => {
    /**
     * - 웹 페이지 진입 시 쿠키가 유효하다면 이 때도 바로 activate 되어야 함.
     * - 즉, “로그인 시점“이 아닌, “인증이 유효하다” 판단 되는 시점에 activate 되어야 함.
     * - connect는 라우트는 가리지 않음 라우트를 가리는건 파티룸 sub, unsub 뿐임
     */
    if (me && !client.connected) {
      client.connect();
    }
  }, [me]);

  return (
    <PartyroomConnectionContext.Provider value={client}>
      {children}
    </PartyroomConnectionContext.Provider>
  );
}

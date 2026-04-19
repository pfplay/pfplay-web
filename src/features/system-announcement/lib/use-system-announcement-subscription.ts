'use client';

import { useEffect, useRef } from 'react';
import { useFetchMe } from '@/entities/me';
import SocketClient from '@/shared/api/websocket/client';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { SystemAnnouncementEvent } from '../model/system-announcement.types';

/**
 * 시스템 공지 WebSocket 구독 훅
 *
 * root layout에서 호출하여, 인증된 유저가 있으면 글로벌 토픽을 구독한다.
 * 백엔드에서 시스템 공지 이벤트를 푸시하면 store에 반영 → 모달 표시.
 */
export default function useSystemAnnouncementSubscription() {
  const { data: me } = useFetchMe();
  const clientRef = useRef<SocketClient | null>(null);

  useEffect(() => {
    if (!me) return;

    const client = new SocketClient();
    clientRef.current = client;
    client.connect();

    // TODO: 백엔드와 토픽 경로 확정 후 수정
    client.subscribe('/sub/system/announcements', (message) => {
      try {
        const event: SystemAnnouncementEvent = JSON.parse(message.body);
        useSystemAnnouncementStore.getState().showAnnouncement(event);
      } catch {
        // malformed message — ignore
      }
    });

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [me]);
}

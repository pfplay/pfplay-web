'use client';

import { useEffect } from 'react';
import { useFetchMe } from '@/entities/me';
import SocketClient from '@/shared/api/websocket/client';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { SystemAnnouncementEvent } from '../model/system-announcement.types';

function isValidAnnouncementEvent(event: unknown): event is SystemAnnouncementEvent {
  if (typeof event !== 'object' || event === null) return false;
  const e = event as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.type === 'string' &&
    typeof e.title === 'string' &&
    typeof e.content === 'string'
  );
}

/**
 * 시스템 공지 WebSocket 구독 훅
 *
 * root layout에서 호출하여, 인증된 유저가 있으면 글로벌 토픽을 구독한다.
 * 백엔드에서 시스템 공지 이벤트를 푸시하면 store에 반영 → 모달 표시.
 *
 * NOTE: PartyroomClient와 별도의 WebSocket 커넥션을 생성한다.
 * 시스템 공지는 파티룸 진입과 무관하게 전역에서 수신해야 하므로 의도적으로 분리.
 * 향후 SocketClient 싱글턴 공유로 리팩토링 검토.
 */
export default function useSystemAnnouncementSubscription() {
  const { data: me } = useFetchMe();

  useEffect(() => {
    if (!me) return;

    const client = new SocketClient();
    client.connect();

    // TODO: 백엔드와 토픽 경로 확정 후 수정
    client.subscribe('/sub/system/announcements', (message) => {
      try {
        const event = JSON.parse(message.body);
        if (!isValidAnnouncementEvent(event)) return;
        useSystemAnnouncementStore.getState().showAnnouncement(event);
      } catch {
        // malformed message — ignore
      }
    });

    return () => {
      client.disconnect();
    };
  }, [me]);
}

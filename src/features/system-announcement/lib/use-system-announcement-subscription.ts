'use client';

import { useEffect } from 'react';
import { useFetchMe } from '@/entities/me';
import SocketClient from '@/shared/api/websocket/client';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { SystemAnnouncementEvent } from '../model/system-announcement.types';

const TOPIC = '/topic/system/announcements';

function isEvent(value: unknown): value is SystemAnnouncementEvent {
  return typeof value === 'object' && value !== null && 'eventType' in value;
}

/**
 * 시스템 공지 WebSocket 구독 훅
 *
 * root layout에서 호출하여, 인증된 유저가 있으면 글로벌 토픽을 구독한다.
 * 백엔드에서 시스템 공지 이벤트(3종)를 푸시하면 store에 반영 → display dispatcher가 분기 표시.
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

    client.subscribe(TOPIC, (message) => {
      try {
        const ev = JSON.parse(message.body);
        if (!isEvent(ev)) return;
        const store = useSystemAnnouncementStore.getState();
        switch (ev.eventType) {
          case 'ANNOUNCEMENT_PUBLISHED':
            store.add(ev);
            break;
          case 'MAINTENANCE_STARTED':
            store.add(ev);
            store.setMaintenance({
              phase: 'ACTIVE',
              startAt: ev.scheduledStartAt,
              endAt: ev.scheduledEndAt,
              messageKo: ev.messageKo,
              messageEn: ev.messageEn,
            });
            break;
          case 'ANNOUNCEMENT_CANCELLED':
            store.cancel(ev.announcementId);
            break;
        }
      } catch {
        // malformed — silent
      }
    });

    return () => {
      client.disconnect();
    };
  }, [me]);
}

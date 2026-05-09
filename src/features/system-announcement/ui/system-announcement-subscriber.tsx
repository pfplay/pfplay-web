'use client';

import useSystemAnnouncementSubscription from '../lib/use-system-announcement-subscription';

/**
 * WebSocket 구독만 담당하는 컴포넌트 (UI 렌더링 없음).
 * root layout에 배치하여 전역에서 시스템 공지를 수신한다.
 */
export default function SystemAnnouncementSubscriber() {
  useSystemAnnouncementSubscription();
  return null;
}

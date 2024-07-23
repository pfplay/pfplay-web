import { NoticeEvent } from '@/shared/api/websocket/types/partyroom';

export default function noticeCallback(event: NoticeEvent) {
  console.log('noticeCallback', event);
}

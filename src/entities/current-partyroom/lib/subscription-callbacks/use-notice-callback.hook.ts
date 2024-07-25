import { useCallback } from 'react';
import { NoticeEvent } from '@/shared/api/websocket/types/partyroom';

export default function useNoticeCallback() {
  return useCallback((event: NoticeEvent) => {
    console.log('NoticeEvent:', event);
  }, []);
}

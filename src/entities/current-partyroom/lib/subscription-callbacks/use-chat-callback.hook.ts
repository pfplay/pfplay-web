import { useCallback } from 'react';
import { ChatEvent } from '@/shared/api/websocket/types/partyroom';

export default function useChatCallback() {
  return useCallback((event: ChatEvent) => {
    console.log('ChatEvent:', event);
  }, []);
}

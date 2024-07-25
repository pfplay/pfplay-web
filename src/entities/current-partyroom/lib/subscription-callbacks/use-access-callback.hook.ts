import { useCallback } from 'react';
import { AccessEvent } from '@/shared/api/websocket/types/partyroom';

export default function useAccessCallback() {
  return useCallback((event: AccessEvent) => {
    console.log('AccessEvent:', event);
  }, []);
}

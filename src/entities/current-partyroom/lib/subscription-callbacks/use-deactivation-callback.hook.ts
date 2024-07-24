import { useCallback } from 'react';
import { DeactivationEvent } from '@/shared/api/websocket/types/partyroom';

export default function useDeactivationCallback() {
  return useCallback((event: DeactivationEvent) => {
    console.log('DeactivationEvent:', event);
  }, []);
}

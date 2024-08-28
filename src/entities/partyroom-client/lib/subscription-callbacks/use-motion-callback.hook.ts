import { useCallback } from 'react';
import { MotionEvent } from '@/shared/api/websocket/types/partyroom';

export default function useMotionCallback() {
  return useCallback((event: MotionEvent) => {
    console.log('MotionEvent:', event);
  }, []);
}

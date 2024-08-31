import { MotionEvent } from '@/shared/api/websocket/types/partyroom';

export default function useMotionCallback() {
  return (event: MotionEvent) => {
    console.log('MotionEvent:', event);
  };
}

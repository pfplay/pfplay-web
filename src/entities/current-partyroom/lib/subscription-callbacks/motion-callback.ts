import { MotionEvent } from '@/shared/api/websocket/types/partyroom';

export default function motionCallback(event: MotionEvent) {
  console.log('motionCallback', event);
}

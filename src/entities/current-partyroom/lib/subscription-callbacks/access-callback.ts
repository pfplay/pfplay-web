import { AccessEvent } from '@/shared/api/websocket/types/partyroom';

export default function accessCallback(event: AccessEvent) {
  console.log('accessCallback', event);
}

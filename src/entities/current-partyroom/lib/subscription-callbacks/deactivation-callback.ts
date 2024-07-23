import { DeactivationEvent } from '@/shared/api/websocket/types/partyroom';

export default function deactivationCallback(event: DeactivationEvent) {
  console.log('deactivationCallback', event);
}

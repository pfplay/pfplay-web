import { ChatEvent } from '@/shared/api/websocket/types/partyroom';

export default function chatCallback(event: ChatEvent) {
  console.log('chatCallback', event);
}

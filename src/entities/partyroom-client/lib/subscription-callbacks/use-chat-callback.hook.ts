import { ChatEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useChatCallback() {
  const { useCurrentPartyroom } = useStores();
  const appendChatMessage = useCurrentPartyroom((state) => state.appendChatMessage);

  return (event: ChatEvent) => {
    appendChatMessage(event.crew.crewId, event.message);
  };
}

import { useEffect, useState } from 'react';
import { useStores } from '@/shared/lib/store/stores.context';

/**
 * 스토어 내 chat은 zustand와는 별개의 구독 매커니즘을 가지고 있어,
 * 구독을 위해 react binding을 위한 hook을 따로 만들어 사용해야 합니다.
 *
 * @see shared/lib/chat/README.md
 */
export function useChat() {
  const { useCurrentPartyroom } = useStores();
  const [chat, chatUpdated, setChatUpdated] = useCurrentPartyroom((state) => [
    state.chat,
    state.chatUpdated,
    state.setChatUpdated,
  ]);
  const [messages, setMessages] = useState(chat.getMessages());

  useEffect(() => {
    const handleMessage = () => {
      setMessages(chat.getMessages());
    };

    chat.addMessageListener(handleMessage);

    return () => {
      chat.removeMessageListener(handleMessage);
    };
  }, [chat]);

  useEffect(() => {
    if (chatUpdated) {
      setMessages(chat.getMessages());
      setChatUpdated(false);
    }
  }, [chatUpdated]);

  return messages;
}

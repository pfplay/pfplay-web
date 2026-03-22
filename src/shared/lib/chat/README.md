# Chat

### vanilla example

```ts
import { Chat } from '@/shared/lib/chat';

type ChatMessage = {
  id: number;
  text: string;
};

const initialMessages: ChatMessage[] = [
  { id: 1, text: 'Hello' },
  { id: 2, text: 'Hi' },
];

// instance 생성
const chat = Chat.create(initialMessages);

// listener 등록
const onMessage = (message: ChatMessage) => {
  console.log(message);
};
chat.addMessageListener(onMessage);

// message 추가
chat.appendMessage({ id: 3, text: 'How are you?' }); // console log: { id: 3, text: 'How are you?' }

// listener 제거
chat.removeMessageListener(onMessage);

// message list 조회
chat.getMessages(); // [{ id: 1, text: 'Hello' }, { id: 2, text: 'Hi' }, { id: 3, text: 'How are you?' }]

// 클리어 (메세지 목록 비우고 listener들 제거)
chat.clear();
```

### react example (state binding)

```tsx
import { useEffect, useState } from 'react';
import { Chat } from '@/shared/lib/chat';

type Props<Message> = {
  initialMessages: Message[];
  onMessage?: (message: Message) => void;
};

export default function useChat<Message>({ initialMessages, onMessage }: Props<Message>) {
  const [chat] = useState(() => Chat.create(initialMessages));
  const [messages, setMessages] = useState<Message[]>(chat.getMessages());

  useEffect(() => {
    const handleMessage = (message: Message) => {
      setMessages(chat.getMessages());
      onMessage?.(message);
    };

    chat.addMessageListener(handleMessage);

    return () => {
      chat.removeMessageListener(handleMessage);
    };
  }, []);

  return {
    messages,
    appendMessage: chat.appendMessage.bind(chat),
  };
}
```

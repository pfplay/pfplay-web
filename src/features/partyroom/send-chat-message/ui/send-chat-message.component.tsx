import { ReactElement, useState } from 'react';
import { usePartyroomClient } from '@/entities/partyroom-client';

type ChildrenProps = {
  message: string;
  setMessage: (message: string) => void;
  send: () => void;
  canSend: boolean;
};

type Props = {
  children: (props: ChildrenProps) => ReactElement;
};

export default function SendMessage({ children }: Props) {
  const client = usePartyroomClient();
  const [message, setMessage] = useState('');
  const canSend = message.length > 0;

  const send = () => {
    if (!canSend) return;
    client.sendChatMessage(message);
    setMessage('');
  };

  return children({
    message,
    setMessage,
    send,
    canSend,
  });
}

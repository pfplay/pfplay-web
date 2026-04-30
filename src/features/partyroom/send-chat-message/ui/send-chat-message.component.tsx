import { ReactElement, useState } from 'react';
import { usePartyroomClient } from '@/entities/partyroom-client';
import { track } from '@/shared/lib/analytics';
import { useStores } from '@/shared/lib/store/stores.context';

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
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);
  const [message, setMessage] = useState('');
  const canSend = message.length > 0;

  const send = () => {
    if (!canSend) return;
    client.sendChatMessage(message);
    if (partyroomId) {
      track('Chat Message Sent', { partyroom_id: partyroomId });
    }
    setMessage('');
  };

  return children({
    message,
    setMessage,
    send,
    canSend,
  });
}

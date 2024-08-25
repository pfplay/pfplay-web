import { createContext, useContext } from 'react';
import SocketClient from '@/shared/api/websocket/client';

export const PartyroomClientContext = createContext<SocketClient | null>(null);

export const usePartyroomClient = () => {
  const context = useContext(PartyroomClientContext);

  if (!context) {
    throw new Error('useStompClient must be used within a StompClientContext');
  }

  return context;
};

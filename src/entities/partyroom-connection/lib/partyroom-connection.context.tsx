import { createContext, useContext } from 'react';
import StompClient from '@/shared/api/websocket/client';

export const PartyroomConnectionContext = createContext<StompClient | null>(null);

export const usePartyroomConnection = () => {
  const context = useContext(PartyroomConnectionContext);

  if (!context) {
    throw new Error('useStompClient must be used within a StompClientContext');
  }

  return context;
};

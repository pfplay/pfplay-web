import { createContext, useContext } from 'react';
import StompClient from '@/shared/api/websocket/client';

export const PartyroomClientContext = createContext<StompClient | null>(null);

export const usePartyroomClient = () => {
  const context = useContext(PartyroomClientContext);

  if (!context) {
    throw new Error('useStompClient must be used within a StompClientContext');
  }

  return context;
};

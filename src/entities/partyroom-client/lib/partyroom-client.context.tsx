import { createContext, useContext } from 'react';
import PartyroomClient from './partyroom-client';

export const PartyroomClientContext = createContext<PartyroomClient | null>(null);

export const usePartyroomClient = () => {
  const context = useContext(PartyroomClientContext);

  if (!context) {
    throw new Error('useStompClient must be used within a StompClientContext');
  }

  return context;
};

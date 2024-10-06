'use client';

import { createContext, useContext } from 'react';
import { DjingQueue } from '@/shared/api/http/types/partyrooms';

export const DjingQueueContext = createContext<DjingQueue | null>(null);

export const useDjingQueue = () => {
  const context = useContext(DjingQueueContext);

  if (context === null) {
    throw new Error('useDjingQueue must be used within a DjingQueueContext.Provider');
  }

  return context;
};

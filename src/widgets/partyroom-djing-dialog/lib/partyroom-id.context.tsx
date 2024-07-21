'use client';

import { createContext, useContext } from 'react';

export const PartyroomIdContext = createContext<number | null>(null);

export const usePartyroomId = () => {
  const context = useContext(PartyroomIdContext);

  if (context === null) {
    throw new Error('usePartyroomId must be used within a PartyroomIdContext.Provider');
  }

  return context;
};

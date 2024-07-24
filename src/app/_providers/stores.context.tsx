'use client';

import { createContext, useContext } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { UIState } from '@/entities/ui-state';
import { CurrentPartyroom } from 'entities/current-partyroom';

export type Stores = {
  useUIState: UseBoundStore<StoreApi<UIState.Model>>;
  useCurrentPartyroom: UseBoundStore<StoreApi<CurrentPartyroom.Model>>;
};

export const StoresContext = createContext<Stores | null>(null);

/**
 * zustand store가 RSC에서 오용되는걸 방지하기 위해 context로 제공.
 * @see https://github.com/pmndrs/zustand/discussions/2200
 */
export const useStores = () => {
  const context = useContext(StoresContext);

  if (!context) {
    throw new Error('useStore must be used within a StoreContext');
  }

  return context;
};

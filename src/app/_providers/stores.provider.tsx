'use client';

import { ReactNode, useState } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { UIState, createUIStateStore } from '@/entities/ui-state';
import { StoresContext, Stores } from '@/shared/lib/store/stores.context';
import { CurrentPartyroom, createCurrentPartyroomStore } from 'entities/current-partyroom';

declare module '@/shared/lib/store/stores.context' {
  interface Stores {
    useUIState: UseBoundStore<StoreApi<UIState.Model>>;
    useCurrentPartyroom: UseBoundStore<StoreApi<CurrentPartyroom.Model>>;
  }
}

export default function StoresProvider({ children }: { children: ReactNode }) {
  const [stores] = useState<Stores>(() => ({
    useUIState: createUIStateStore(),
    useCurrentPartyroom: createCurrentPartyroomStore(),
  }));

  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>;
}

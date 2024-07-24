'use client';

import { ReactNode, useState } from 'react';
import { createUIStateStore } from '@/entities/ui-state';
import { createCurrentPartyroomStore } from 'entities/current-partyroom';
import { StoresContext, Stores } from './stores.context';

export default function StoresProvider({ children }: { children: ReactNode }) {
  const [stores] = useState<Stores>(() => ({
    useUIState: createUIStateStore(),
    useCurrentPartyroom: createCurrentPartyroomStore(),
  }));

  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>;
}

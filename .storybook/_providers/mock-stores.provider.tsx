import { Stores, StoresContext } from '@/shared/lib/store/stores.context';
import { ReactNode, useState } from 'react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom';
import { createUIStateStore } from '@/entities/ui-state';

export default function MockStoresProvider({ children }: { children: ReactNode }) {
  const [stores] = useState<Stores>(() => ({
    useUIState: createUIStateStore(),
    useCurrentPartyroom: createCurrentPartyroomStore(),
  }));

  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>;
}

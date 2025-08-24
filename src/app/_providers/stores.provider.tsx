'use client';

import { ReactNode, useRef } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { CurrentPartyroom, createCurrentPartyroomStore } from '@/entities/current-partyroom';
import { Preview, createPreviewStore } from '@/entities/music-preview';
import { UIState, createUIStateStore } from '@/entities/ui-state';
import { StoresContext, Stores } from '@/shared/lib/store/stores.context';

declare module '@/shared/lib/store/stores.context' {
  interface Stores {
    useUIState: UseBoundStore<StoreApi<UIState.Model>>;
    useCurrentPartyroom: UseBoundStore<StoreApi<CurrentPartyroom.Model>>;
    useMusicPreview: UseBoundStore<StoreApi<Preview.Model>>;
  }
}

export default function StoresProvider({ children }: { children: ReactNode }) {
  const storesRef = useRef<Stores | null>(null);

  if (storesRef.current === null) {
    storesRef.current = {
      useUIState: createUIStateStore(),
      useCurrentPartyroom: createCurrentPartyroomStore(),
      useMusicPreview: createPreviewStore(),
    };
  }

  return <StoresContext.Provider value={storesRef.current}>{children}</StoresContext.Provider>;
}

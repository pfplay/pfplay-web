'use client';

import { createContext, useContext } from 'react';

type SelectedAvatarState = {
  bodyUri?: string;
  faceUri?: string;
  setBodyUri: (uri?: string) => void;
  setFaceUri: (uri?: string) => void;
};

export const SelectedAvatarStateContext = createContext<SelectedAvatarState | null>(null);

export const useSelectedAvatarState = () => {
  const context = useContext(SelectedAvatarStateContext);

  if (!context) {
    throw new Error('useSelectedAvatarState must be used within a SelectedAvatarStateProvider');
  }

  return context;
};

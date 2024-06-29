'use client';

import { createContext, useContext } from 'react';
import { AvatarBody } from '@/shared/api/types/users';

type SelectedAvatarState = {
  body?: AvatarBody;
  setBody: (body: AvatarBody) => void;

  faceUri?: string;
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

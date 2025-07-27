'use client';

import { createContext, RefObject, useContext } from 'react';
import { FacePos } from '@/entities/avatar/model/avatar.model';
import { AvatarBody } from '@/shared/api/http/types/users';

type SelectedAvatarState = {
  body?: AvatarBody;
  setBody: (body: AvatarBody) => void;

  faceUri?: string;
  setFaceUri: (uri?: string) => void;

  avatarDOM: RefObject<HTMLDivElement>; // TODO: 미사용 시 삭제 필요할 수 있음

  facePos?: FacePos;
  setFacePos: (pos: FacePos) => void;
};

export const SelectedAvatarStateContext = createContext<SelectedAvatarState | null>(null);

export const useSelectedAvatarState = () => {
  const context = useContext(SelectedAvatarStateContext);

  if (!context) {
    throw new Error('useSelectedAvatarState must be used within a SelectedAvatarStateProvider');
  }

  return context;
};

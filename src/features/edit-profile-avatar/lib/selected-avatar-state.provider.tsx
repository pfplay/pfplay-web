'use client';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { FacePos } from '@/entities/avatar/model/avatar.model';
import { DEFAULT_FACE_POS } from '@/entities/avatar/ui/react-moveable/moveable-face';
import { useSuspenseFetchMe } from '@/entities/me';
import { useFetchAvatarBodies } from '@/features/edit-profile-avatar/api/use-fetch-avatar-bodies.query';
import { AvatarBody } from '@/shared/api/http/types/users';
import { SelectedAvatarStateContext } from './selected-avatar-state.context';

export default function SelectedAvatarStateProvider({ children }: { children: ReactNode }) {
  const { data: me } = useSuspenseFetchMe();
  const { data: bodies } = useFetchAvatarBodies();
  const [selectedBody, setSelectedBody] = useState<AvatarBody>();
  const [selectedFaceUri, setSelectedFaceUri] = useState<string>();
  const selectedAvatarDOM = useRef<HTMLDivElement>(null);
  const [selectedFacePos, setSelectedFacePos] = useState<FacePos>(DEFAULT_FACE_POS); // TODO: 이전 선택된 값으로 초기화해야함

  const contextValue = useMemo(
    () => ({
      body: selectedBody,
      setBody: setSelectedBody,
      faceUri: selectedFaceUri,
      setFaceUri: setSelectedFaceUri,
      avatarDOM: selectedAvatarDOM,
      facePos: selectedFacePos,
      setFacePos: setSelectedFacePos,
    }),
    [selectedBody, selectedFaceUri, selectedFacePos]
  );

  useEffect(() => {
    /**
     * selectedBody와 selectedFaceUri, selectedFacePos 초기화
     */
    if (bodies && !selectedBody) {
      setSelectedBody(bodies.find((body) => body.resourceUri === me.avatarBodyUri));
      setSelectedFaceUri(me.avatarFaceUri);
      setSelectedFacePos(DEFAULT_FACE_POS);
    }
  }, [bodies, selectedBody, selectedFacePos]);

  return (
    <SelectedAvatarStateContext.Provider value={contextValue}>
      {children}
    </SelectedAvatarStateContext.Provider>
  );
}

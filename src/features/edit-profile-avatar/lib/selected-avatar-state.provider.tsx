'use client';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';
import { useFetchAvatarBodies } from '@/features/edit-profile-avatar/api/use-fetch-avatar-bodies.query';
import { AvatarBody, AvatarFacePos } from '@/shared/api/http/types/users';
import { SelectedAvatarStateContext } from './selected-avatar-state.context';

export default function SelectedAvatarStateProvider({ children }: { children: ReactNode }) {
  const { data: me } = useSuspenseFetchMe();
  const { data: bodies } = useFetchAvatarBodies();
  const [selectedBody, setSelectedBody] = useState<AvatarBody>();
  const [selectedFaceUri, setSelectedFaceUri] = useState<string>();
  const [selectedFacePos, setSelectedFacePos] = useState<AvatarFacePos>({
    offsetX: me.offsetX,
    offsetY: me.offsetY,
    scale: me.scale,
  });

  const contextValue = useMemo(
    () => ({
      body: selectedBody,
      setBody: setSelectedBody,
      faceUri: selectedFaceUri,
      setFaceUri: setSelectedFaceUri,
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
      setSelectedFacePos({
        offsetX: me.offsetX,
        offsetY: me.offsetY,
        scale: me.scale,
      });
    }
  }, [bodies, selectedBody, selectedFacePos]);

  return (
    <SelectedAvatarStateContext.Provider value={contextValue}>
      {children}
    </SelectedAvatarStateContext.Provider>
  );
}

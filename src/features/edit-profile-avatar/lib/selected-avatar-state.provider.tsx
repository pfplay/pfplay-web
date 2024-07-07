'use client';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';
import { useFetchAvatarBodies } from '@/features/edit-profile-avatar/api/use-fetch-avatar-bodies.query';
import { AvatarBody } from '@/shared/api/http/types/users';
import { SelectedAvatarStateContext } from './selected-avatar-state.context';

export default function SelectedAvatarStateProvider({ children }: { children: ReactNode }) {
  const { data: me } = useSuspenseFetchMe();
  const { data: bodies } = useFetchAvatarBodies();
  const [selectedBody, setSelectedBody] = useState<AvatarBody>();
  const [selectedFaceUri, setSelectedFaceUri] = useState<string>();

  const contextValue = useMemo(
    () => ({
      body: selectedBody,
      setBody: setSelectedBody,
      faceUri: selectedFaceUri,
      setFaceUri: setSelectedFaceUri,
    }),
    [selectedBody, selectedFaceUri]
  );

  useEffect(() => {
    /**
     * selectedBody와 selectedFaceUri 초기화
     */
    if (bodies && !selectedBody) {
      setSelectedBody(bodies.find((body) => body.resourceUri === me.avatarBodyUri));
      setSelectedFaceUri(me.avatarFaceUri);
    }
  }, [bodies, selectedBody]);

  return (
    <SelectedAvatarStateContext.Provider value={contextValue}>
      {children}
    </SelectedAvatarStateContext.Provider>
  );
}

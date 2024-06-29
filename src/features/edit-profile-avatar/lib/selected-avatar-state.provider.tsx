'use client';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useFetchMe } from '@/entities/me';
import { SelectedAvatarStateContext } from './selected-avatar-state.context';

export default function SelectedAvatarStateProvider({ children }: { children: ReactNode }) {
  const { data: me } = useFetchMe();
  const [selectedBodyUri, setSelectedBodyUri] = useState<string>();
  const [selectedFaceUri, setSelectedFaceUri] = useState<string>();

  const contextValue = useMemo(
    () => ({
      bodyUri: selectedBodyUri,
      faceUri: selectedFaceUri,
      setBodyUri: setSelectedBodyUri,
      setFaceUri: setSelectedFaceUri,
    }),
    [selectedBodyUri, selectedFaceUri]
  );

  useEffect(() => {
    if (me) {
      setSelectedBodyUri(me.avatarBodyUri);
      setSelectedFaceUri(me.avatarFaceUri);
    }
  }, [me]);

  return (
    <SelectedAvatarStateContext.Provider value={contextValue}>
      {children}
    </SelectedAvatarStateContext.Provider>
  );
}

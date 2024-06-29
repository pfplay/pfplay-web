'use client';
import { FC } from 'react';
import { AvatarFace } from '@/shared/api/types/users';
import AvatarListItem from './avatar-list-item.component';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';

interface Props {
  meta: AvatarFace;
}

const AvatarFaceListItem: FC<Props> = ({ meta }) => {
  const selectedAvatar = useSelectedAvatarState();

  const handleAvatarImgClick = () => {
    selectedAvatar.setFaceUri(meta.resourceUri);
  };

  return (
    <AvatarListItem
      handleClick={handleAvatarImgClick}
      imageSrc={meta.resourceUri}
      name={meta.name}
      selected={selectedAvatar.faceUri === meta.resourceUri}
    />
  );
};

export default AvatarFaceListItem;

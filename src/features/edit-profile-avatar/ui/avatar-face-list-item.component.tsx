'use client';
import { FC } from 'react';
import { Nft } from '@/entities/wallet';
import { AvatarFace } from '@/shared/api/http/types/users';
import AvatarListItem from './avatar-list-item.component';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';

interface Props {
  meta: AvatarFace | Nft.Model;
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
      testId='avatar-face-list-item'
    />
  );
};

export default AvatarFaceListItem;

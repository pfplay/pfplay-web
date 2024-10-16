'use client';
import { FC } from 'react';
import { AvatarFace } from '@/shared/api/http/types/users';
import AvatarListItem from './avatar-list-item.component';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';
import * as Nft from '../model/nft.model';

interface Props {
  meta: AvatarFace | Nft.RefinedModel;
  hideSelected: boolean;
}

const AvatarFaceListItem: FC<Props> = ({ meta, hideSelected }) => {
  const selectedAvatar = useSelectedAvatarState();

  const handleAvatarImgClick = () => {
    selectedAvatar.setFaceUri(meta.resourceUri);
  };

  return (
    <AvatarListItem
      handleClick={handleAvatarImgClick}
      imageSrc={meta.resourceUri}
      name={meta.name}
      selected={!hideSelected && selectedAvatar.faceUri === meta.resourceUri}
    />
  );
};

export default AvatarFaceListItem;

'use client';
import { FC } from 'react';
import { AvatarBody } from '@/shared/api/types/users';
import AvatarListItem from './avatar-list-item.component';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';

interface Props {
  meta: AvatarBody;
}

const AvatarBodyListItem: FC<Props> = ({ meta }) => {
  const selectedAvatar = useSelectedAvatarState();

  const handleAvatarImgClick = () => {
    selectedAvatar.setBody(meta);
  };

  return (
    <AvatarListItem
      handleClick={handleAvatarImgClick}
      imageSrc={meta.resourceUri}
      name={meta.name}
      selected={selectedAvatar.body?.resourceUri === meta.resourceUri}
    />
  );
};

export default AvatarBodyListItem;

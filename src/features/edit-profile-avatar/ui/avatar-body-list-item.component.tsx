'use client';
import { FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Me } from '@/entities/me';
import { QueryKeys } from '@/shared/api/http/query-keys';
import AvatarListItem from './avatar-list-item.component';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';
import * as AvatarBody from '../model/avatar-body.model';

interface Props {
  meta: AvatarBody.Model;
}

const AvatarBodyListItem: FC<Props> = ({ meta }) => {
  const queryClient = useQueryClient();
  const me = queryClient.getQueryData<Me.Model>([QueryKeys.Me]);
  const selectedAvatar = useSelectedAvatarState();
  const locked = AvatarBody.locked(meta, me);

  const handleAvatarImgClick = () => {
    selectedAvatar.setBody(meta);
  };

  return (
    <AvatarListItem
      handleClick={handleAvatarImgClick}
      imageSrc={meta.resourceUri}
      name={meta.name}
      selected={selectedAvatar.body?.resourceUri === meta.resourceUri}
      locked={locked.is}
      lockedMessage={locked.reason}
    />
  );
};

export default AvatarBodyListItem;

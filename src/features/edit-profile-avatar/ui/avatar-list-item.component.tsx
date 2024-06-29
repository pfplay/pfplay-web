'use client';
import Image from 'next/image';
import { FC } from 'react';
import { SetRequired } from 'type-fest';
import { AvatarPartsDefaultMeta } from '@/shared/api/types/users';
import { cn } from '@/shared/lib/functions/cn';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';

interface Props {
  meta: SetRequired<Partial<AvatarPartsDefaultMeta>, 'resourceUri'>;
  from: 'body' | 'face';
}

const AvatarListItem: FC<Props> = ({ meta, from }) => {
  const selectedAvatar = useSelectedAvatarState();

  const handleAvatarImgClick = () => {
    if (from === 'body') {
      selectedAvatar.setBodyUri(meta.resourceUri);
    }
    if (from === 'face') {
      selectedAvatar.setFaceUri(meta.resourceUri);
    }
  };

  const isSelected = (() => {
    if (from === 'body') {
      return selectedAvatar.bodyUri === meta.resourceUri;
    }
    if (from === 'face') {
      return selectedAvatar.faceUri === meta.resourceUri;
    }
  })();

  return (
    <div className='relative w-full max-width-[200px] aspect-square cursor-pointer group'>
      {/* <>
      // FIXME: BE api 상세에 맞춰 아래 코드 수정 and 해금 안된 이미지 대응
        <div className='absolute inset-0 flexRow justify-start items-start bg-transparent group-hover:opacity-60 group-hover:bg-black z-30' />
        <Typography
          type='detail1'
          className='absolute inset-3 text-white z-50 opacity-0 group-hover:opacity-100'
        >
          DJ 포인트 5점 획득 시 잠금해제 할 수 있어요!
        </Typography>
      </> */}

      <Image
        role='button'
        tabIndex={-1}
        onKeyDown={(e) => e.key === 'Enter' && handleAvatarImgClick()}
        onClick={handleAvatarImgClick}
        src={meta.resourceUri}
        alt={meta.name ? `Avatar Parts - ${meta.name}` : 'Avatar Parts'}
        fill
        sizes='(max-width:200px) 100vw, 200px'
        className={cn('bg-gray-800 max-h-[200px] aspect-square select-none', {
          'outline-none border-[1px] border-red-300': isSelected,
        })}
      />
    </div>
  );
};

export default AvatarListItem;

'use client';
import Image from 'next/image';
import { FC } from 'react';
import { AvatarParts } from '@/api/types/avatar';
import { cn } from '@/shared/lib/functions/cn';
import { useSelectedAvatarStore } from '@/store/avatar.store';

interface Props {
  avatar: AvatarParts;
  from: 'body' | 'face';
}

const AvatarListItem: FC<Props> = ({ avatar, from }) => {
  const [selectedAvatarParts, setSelectedAvatarParts] = useSelectedAvatarStore((state) => [
    state.selectedAvatarParts,
    state.setSelectedAvatarParts,
  ]);

  const handleAvatarImgClick = (parts: AvatarParts) => {
    if (from === 'body') {
      setSelectedAvatarParts({ ...selectedAvatarParts, body: parts });
      return;
    } else if (from === 'face') {
      setSelectedAvatarParts({ ...selectedAvatarParts, face: parts });
      return;
    }
  };

  const selected = (id: number | string) => {
    if (from === 'body') {
      return selectedAvatarParts?.body?.id === id;
    } else if (from === 'face') {
      return selectedAvatarParts?.face?.id === id;
    }
  };

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
        src={avatar.image}
        alt={avatar.name}
        fill
        sizes='(max-width:200px) 100vw, 200px'
        onClick={() => handleAvatarImgClick(avatar)}
        className={cn(
          'bg-gray-800 max-h-[200px] aspect-square select-none',
          selected(avatar.id) && 'border-[1px] border-red-300'
        )}
      />
    </div>
  );
};

export default AvatarListItem;

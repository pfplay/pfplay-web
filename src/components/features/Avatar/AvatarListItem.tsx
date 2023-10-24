import Image from 'next/image';
import { FC } from 'react';
import { AvatarParts } from '@/api/@types/Avatar';
import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

interface Props {
  avatar: AvatarParts;
  selected: boolean;
  setSelected: (face: AvatarParts) => void;
}

const AvatarListItem: FC<Props> = ({ avatar, selected, setSelected }) => {
  return (
    <div className='relative w-full max-width-[200px] aspect-square cursor-pointer group'>
      {/* FIXME: BE api 상세에 맞춰 아래 코드 수정 */}
      {!avatar.purchased && (
        <>
          <div className='absolute inset-0 flexRow justify-start items-start bg-transparent group-hover:opacity-60 group-hover:bg-black z-30' />
          <Typography
            type='detail1'
            className='absolute inset-3 text-white z-50 opacity-0 group-hover:opacity-100'
          >
            DJ 포인트 5점 획득 시 잠금해제 할 수 있어요!
          </Typography>
        </>
      )}

      <Image
        key={avatar.id}
        src={avatar.image}
        alt={avatar.name}
        fill
        sizes='(max-width:200px) 100vw, 200px'
        onClick={() => setSelected(avatar)}
        className={cn(
          'bg-gray-800 max-h-[200px] aspect-square select-none',
          selected && 'border-[1px] border-red-300'
        )}
      />
    </div>
  );
};

export default AvatarListItem;

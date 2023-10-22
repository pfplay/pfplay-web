import Image from 'next/image';
import { FC } from 'react';
import { AvatarParts } from '@/api/@types/Avatar';
import { cn } from '@/utils/cn';

interface Props {
  avatar: AvatarParts;
  selected: boolean;
  setSelected: (face: AvatarParts) => void;
}

const AvatarListItem: FC<Props> = ({ avatar, selected, setSelected }) => {
  return (
    <div className='relative w-full max-width-[200px] aspect-square cursor-pointer'>
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

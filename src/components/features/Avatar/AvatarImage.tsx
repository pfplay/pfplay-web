import Image from 'next/image';

import { cn } from '@/utils/cn';

export type AvatarImg = {
  id: number;
  type: 'basic' | 'dj' | 'room' | 'ref';
  name: string;
  image: string;
  point: number;
};

interface AvatarImageProps {
  avatar: AvatarImg;
  selectedImg: AvatarImg;
  setSelectedImage: (face: AvatarImg) => void;
}

const AvatarImage = ({ avatar, selectedImg, setSelectedImage }: AvatarImageProps) => {
  return (
    <div className='relative w-full max-width-[200px] aspect-square cursor-pointer'>
      <Image
        key={avatar.id}
        src={avatar.image}
        alt={avatar.name}
        fill
        sizes='(max-width:200px) 100vw, 200px'
        onClick={() => setSelectedImage({ ...avatar })}
        className={cn(
          'bg-gray-800 max-h-[200px] aspect-square select-none',
          selectedImg.id === avatar.id && 'border-[1px] border-red-300'
        )}
      />
    </div>
  );
};

export default AvatarImage;

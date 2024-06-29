'use client';
import Image from 'next/image';
import { cn } from '@/shared/lib/functions/cn';

interface Props {
  handleClick: () => void;
  imageSrc: string;
  name?: string;
  isSelected: boolean;
}

const AvatarListItem = ({ handleClick, imageSrc, name, isSelected }: Props) => {
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
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onClick={handleClick}
        src={imageSrc}
        alt={name ? `Avatar Parts - ${name}` : 'Avatar Parts'}
        fill
        objectFit='contain'
        sizes='(max-width:200px) 100vw, 200px'
        className={cn('bg-gray-800 max-h-[200px] aspect-square select-none', {
          'outline-none border-[1px] border-red-300': isSelected,
        })}
      />
    </div>
  );
};

export default AvatarListItem;

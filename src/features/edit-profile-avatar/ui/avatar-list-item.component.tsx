'use client';
import Image from 'next/image';
import { Typography } from '@/shared/ui/components/typography';
import { PFLock } from '@/shared/ui/icons';

interface Props {
  handleClick: () => void;
  imageSrc: string;
  name?: string;
  selected: boolean;
  locked?: boolean;
  lockedMessage?: string;
}

const AvatarListItem = ({
  handleClick,
  imageSrc,
  name,
  selected,
  locked,
  lockedMessage,
}: Props) => {
  return (
    <div className='relative w-full max-width-[200px] aspect-square cursor-pointer group'>
      <Image
        role='button'
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onClick={handleClick}
        src={imageSrc}
        alt={name ? `Avatar Parts - ${name}` : 'Avatar Parts'}
        fill
        objectFit='contain'
        sizes='(max-width:200px) 100vw, 200px'
        className='bg-gray-800 max-h-[200px] aspect-square select-none'
      />

      {!locked && selected && (
        <div className='absolute inset-0 bg-dim z-1 border-[3px] border-red-300 rounded' />
      )}

      {locked && (
        <div className='absolute inset-0 bg-dim z-1 cursor-not-allowed'>
          <div aria-label='Lock Icon' className='absolute right-[12px] bottom-[12px]'>
            <PFLock className='text-red-500' width={48} height={48} />
          </div>

          <div className='absolute inset-0 z-1 p-[12px] group'>
            <Typography
              type='detail1'
              className='text-white opacity-0 group-hover:opacity-100'
              overflow='break-words'
            >
              {lockedMessage}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarListItem;

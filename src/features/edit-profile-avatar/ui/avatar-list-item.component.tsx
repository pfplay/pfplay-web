'use client';
import Image from 'next/image';
import { Typography } from '@/shared/ui/components/typography';
import { PFLock } from '@/shared/ui/icons';

interface Props {
  handleClick: () => void;
  imageSrc: string;
  name?: string;
  isSelected: boolean;
  locked?: boolean;
  lockedMessage?: string;
}

const AvatarListItem = ({
  handleClick,
  imageSrc,
  name,
  isSelected,
  locked,
  lockedMessage,
}: Props) => {
  return (
    <div className='relative w-full max-width-[200px] aspect-square cursor-pointer group'>
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
        className='bg-gray-800 max-h-[200px] aspect-square select-none'
      />

      {isSelected && (
        <div className='absolute inset-0 bg-dim z-1 outline outline-[3px] -outline-offset-[3px] outline-red-300' />
      )}

      {locked && (
        <>
          <div aria-label='Lock Icon' className='absolute right-[12px] bottom-[12px] z-0'>
            <PFLock className='text-red-500' width={48} height={48} />
          </div>

          <div className='opacity-0 hover:opacity-100 absolute inset-0 bg-dim z-1'>
            <div className='p-[12px]'>
              <Typography type='detail1' className='text-white' overflow='break-words'>
                {lockedMessage}
              </Typography>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AvatarListItem;

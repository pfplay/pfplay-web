import Image from 'next/image';
import React from 'react';
import { cn } from '@/utils/cn';
import Tag from './@atoms/Tag';
import Typography from './@atoms/Typography';

type DjListItemUserConfig = {
  username: string;
  src: string;
  alt?: string;
};

type DjListItemProps = {
  order?: string;
  variant?: 'basic' | 'outlineAccent' | 'filled';
  userConfig: DjListItemUserConfig;
  suffixTagValue?: string;
};

const DjListItem = ({
  userConfig: { username, src, alt },
  order,
  suffixTagValue,
  variant = 'basic',
}: DjListItemProps) => {
  return (
    <div
      className={cn(
        'relative w-fit flexRow justify-start items-center gap-3 h-12 px-4 rounded-[4px]',
        variant === 'outlineAccent' && 'border border-red-300 rounded-[40px]',
        variant === 'filled' && 'bg-gray-800'
      )}
    >
      {order && (
        <Typography type='detail2' className='text-gray-200'>
          {order}
        </Typography>
      )}

      <div className={cn('flexRow justify-center items-center gap-2')}>
        <Image
          src={src ?? '/images/ETC/monkey.png'}
          alt={alt ?? username}
          width={32}
          height={32}
          className='w-8 h-8 rounded-full'
        />
        <Typography type='detail1' className='text-white'>
          {username}
        </Typography>
      </div>

      {suffixTagValue && <Tag value={suffixTagValue} variant='filled' />}
    </div>
  );
};

export default DjListItem;

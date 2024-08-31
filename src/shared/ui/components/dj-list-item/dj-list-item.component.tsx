import Image from 'next/image';

import { cn } from '@/shared/lib/functions/cn';
import { Tag } from '@/shared/ui/components/tag';
import { Typography } from '@/shared/ui/components/typography';

export type DjListItemUserConfig = {
  username: string;
  src: string;
  alt?: string;
};

type DjListItemProps = {
  order?: string;
  variant?: 'basic' | 'accent' | 'filled';
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
        variant === 'accent' && 'border border-red-300 rounded-[40px]',
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
          src={src || '/images/Temp/face.png'}
          alt={alt || username}
          width={32}
          height={32}
          className='w-8 h-8 rounded-full'
        />
        <Typography
          type={variant === 'accent' ? 'body3' : 'detail1'}
          className={cn(variant === 'accent' ? 'text-red-300' : 'text-white')}
          overflow='ellipsis'
        >
          {username}
        </Typography>
      </div>

      {suffixTagValue && <Tag value={suffixTagValue} variant='filled' />}
    </div>
  );
};

export default DjListItem;

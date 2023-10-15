import Image from 'next/image';
import React from 'react';
import Typography from '@/components/@shared/@atoms/Typography';
import Icons from '@/components/__legacy__/Icons';
import { cn } from '@/utils/cn';

interface MembersInfoSectionProps {
  membersCount?: number;
  // 3명까지만 보여줌
  // FIXME: API 어떤 식으로 받아올지 확인 후 수정
  membersImage?: { src?: string; alt?: string }[];
}

const MembersInfoSection = ({ membersCount, membersImage }: MembersInfoSectionProps) => {
  return (
    <div className='relative items-center flexRow'>
      <div className='items-center flexRow gap-[6px]'>
        <Icons.profile width={18} height={18} />
        <Typography type='body3' className='text-gray-50'>
          {membersCount ? membersCount : 0}
        </Typography>
      </div>
      <ul className='items-center absolute left-[96px] flexRow gap-x-2'>
        {membersImage?.slice(0, 3).map((config, i) => (
          // FIXME: api에서 받아온 정보로 수정
          <li key={i} className='w-6 h-6 rounded-full bg-slate-400'>
            <Image
              priority
              src={config.src || '/image/profile.png'}
              alt={config.alt || 'party member'}
              width={24}
              height={24}
              className={cn('w-full h-full object-contain select-none')}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MembersInfoSection;

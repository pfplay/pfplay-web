'use client';
import Image from 'next/image';
import Link from 'next/link';

import BackdropBlurContainer from '@/components/shared/BackdropBlurContainer';
import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';
import MembersInfoSection from './MembersInfoSection';

const PartiesMainStageCard = () => {
  return (
    <BackdropBlurContainer>
      <Link
        /* FIXME */
        href={`/parties/${1}`}
        className='flexCol tablet:flexRow items-start tablet:items-end gap-[20px] tablet:gap-[50px] desktop:gap-[169px] px-7 py-10 backdrop-blur-xl bg-backdrop-black/80'
      >
        <div className='flexCol gap-6 tablet:gap-12 pb-[21px]'>
          <div className='gap-3 flexCol'>
            <Typography type='title2' className='text-white'>
              PFPlay Main Stage
            </Typography>
            <Typography type='detail1' className='text-gray-200'>
              파티에 오신 것을 환영합니다
            </Typography>
          </div>
          <MembersInfoSection membersCount={50} membersImage={[{}, {}, {}, {}]} />
        </div>
        <div className='flex-1 max-w-full min-w-0 flexRow pt-4 border-t border-gray-700'>
          <div className='flexRow gap-[12px] items-center max-w-full'>
            <div className='w-[80px] h-[44px] bg-gray-700'>
              <Image
                priority
                src={'/images/ETC/PlaylistThumbnail.png'}
                alt={'image'}
                width={80}
                height={44}
                className={cn('w-full h-full object-contain select-none')}
              />
            </div>
            <Typography
              type='caption1'
              overflow='ellipsis'
              className='flex-1 select-none text-gray-50'
            >
              NewJeans (뉴진스) Official MV NewJeans (뉴진스) Official MV NewJeans (뉴진스) NewJeans
              (뉴진스) Official MV NewJeans (뉴진스) Official MV NewJeans (뉴진스)
            </Typography>
          </div>
        </div>
      </Link>
    </BackdropBlurContainer>
  );
};

export default PartiesMainStageCard;

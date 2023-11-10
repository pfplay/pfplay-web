'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React from 'react';
import BackdropBlurContainer from '@/components/shared/BackdropBlurContainer';
import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';
import MembersInfoSection from './MembersInfoSection';

const PartiesMainStageCard = () => {
  const router = useRouter();

  return (
    <BackdropBlurContainer>
      <div className='flexRow items-center gap-[50px] desktop:gap-[169px] px-7 py-10 backdrop-blur-xl bg-backdrop-black/80'>
        <div className='flexCol gap-12 pb-[21px]'>
          <div className='gap-3 flexCol'>
            <Typography
              type='title2'
              onClick={() => router.push(`/parties/${1}`)} // TODO: set proper route for main stage
              className='text-white'
            >
              PFPlay Main Stage
            </Typography>
            <Typography type='detail1' className='text-gray-200'>
              파티에 오신 것을 환영합니다
            </Typography>
          </div>
          <MembersInfoSection membersCount={50} membersImage={[{}, {}, {}, {}]} />
        </div>
        <div className='w-full flexRow items-end justify-start pt-4 mt-auto border-t border-gray-700 '>
          <div className='relative w-full flexRow justify-start  gap-[12px] items-center'>
            <div className='relative w-[80px] h-[44px] bg-gray-700'>
              <Image
                priority
                src={'/images/ETC/PlaylistThumbnail.png'}
                alt={'image'}
                width={80}
                height={44}
                className={cn('w-full h-full object-contain select-none')}
              />
            </div>
            <div className='flex-1 min-w-0 max-w-[300px] tablet:max-w-[350px] laptop:max-w-[390px] desktop:max-w-[580px] select-none'>
              <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
                NewJeans (뉴진스) Official MV NewJeans (뉴진스) Official MV NewJeans (뉴진스)
                NewJeans (뉴진스) Official MV NewJeans (뉴진스) Official MV NewJeans (뉴진스)
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </BackdropBlurContainer>
  );
};

export default PartiesMainStageCard;

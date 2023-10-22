'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React from 'react';
import BackdropBlurContainer from '@/components/shared/BackdropBlurContainer';
import { PlayListItemType } from '@/components/shared/atoms/PlayListItem';
import Typography from '@/components/shared/atoms/Typography';
import { PFInfoOutline } from '@/components/shared/icons';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/routes';
import { replaceDynamic } from '@/utils/routes/replaceDynamic';
import MembersInfoSection from './MembersInfoSection';

interface PartyRoomCardProps {
  roomId: number;
  // TODO: set proper type for value when api is connected
  playListItemConfig: PlayListItemType;
}

const PartyRoomCard = ({ roomId, playListItemConfig }: PartyRoomCardProps) => {
  const router = useRouter();

  return (
    <BackdropBlurContainer>
      <div
        onClick={() =>
          router.push(
            replaceDynamic(ROUTES.PARTIES.room, {
              id: roomId, // TODO: set proper route with id
            })
          )
        }
        className='flexCol gap-[61px] py-6  px-7  backdrop-blur-xl bg-backdrop-black/80'
      >
        <Typography type='title2' className='text-gray-50'>
          갓생을 위한 노동요
        </Typography>
        <div className='gap-4 flexCol'>
          <div className='relative w-full flexRow justify-start rounded gap-[12px] items-center'>
            <div className='relative w-[80px] h-[44px] bg-gray-700'>
              <Image
                priority
                src={playListItemConfig?.src ?? '/images/ETC/PlaylistThumbnail.png'}
                alt={playListItemConfig?.alt ?? playListItemConfig.title}
                width={80}
                height={44}
                className={cn('w-full h-full object-contain select-none')}
              />
            </div>
            <div className='flex-1 min-w-0 select-none'>
              <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
                {playListItemConfig?.title}
              </Typography>
            </div>
          </div>
          <div className='bg-gray-600 h-[1px]' />
          <div className='items-center justify-between flexRow'>
            <MembersInfoSection membersCount={50} membersImage={[{}, {}, {}, {}]} />
            <PFInfoOutline width={24} height={24} />
          </div>
        </div>
      </div>
    </BackdropBlurContainer>
  );
};

export default PartyRoomCard;

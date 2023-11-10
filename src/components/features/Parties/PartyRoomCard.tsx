'use client';
import Image from 'next/image';
import Link from 'next/link';

import BackdropBlurContainer from '@/components/shared/BackdropBlurContainer';
import { PlayListItemType } from '@/components/shared/atoms/PlayListItem';
import Typography from '@/components/shared/atoms/Typography';
import { PFInfoOutline } from '@/components/shared/icons';
import { cn } from '@/utils/cn';
import MembersInfoSection from './MembersInfoSection';

interface PartyRoomCardProps {
  roomId: number;
  // TODO: set proper type for value when api is connected
  playListItemConfig: PlayListItemType;
}

const PartyRoomCard = ({ roomId, playListItemConfig }: PartyRoomCardProps) => {
  return (
    <BackdropBlurContainer>
      <Link
        /* TODO: set proper route with id */
        href={`/parties/${roomId}`}
        className='flexCol gap-[61px] py-6 px-7 backdrop-blur-xl bg-backdrop-black/80'
      >
        <Typography type='title2' className='text-gray-50'>
          갓생을 위한 노동요
        </Typography>
        <div className='gap-4 flexCol max-w-full'>
          <div className='flex-1 max-w-full min-w-0 flexRowCenter gap-[12px] rounded'>
            <div className='w-[80px] h-[44px] bg-gray-700'>
              <Image
                priority
                src={playListItemConfig?.src ?? '/images/ETC/PlaylistThumbnail.png'}
                alt={playListItemConfig?.alt ?? playListItemConfig.title}
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
              {playListItemConfig?.title}
            </Typography>
          </div>
          <div className='bg-gray-600 h-[1px]' />
          <div className='items-center justify-between flexRow'>
            <MembersInfoSection membersCount={50} membersImage={[{}, {}, {}, {}]} />
            <PFInfoOutline width={24} height={24} />
          </div>
        </div>
      </Link>
    </BackdropBlurContainer>
  );
};

export default PartyRoomCard;

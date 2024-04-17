'use client';
import Image from 'next/image';
import Link from 'next/link';

import { PartyRoomSummary } from '@/api/types/parties';
import { cn } from '@/shared/lib/cn';
import BackdropBlurContainer from '@/shared/ui/components/backdrop-blur-container/backdrop-blur-container.component';
import Typography from '@/shared/ui/components/typography/typography.component';
import { PFInfoOutline } from '@/shared/ui/icons';
import Participants from './participants.component';

interface PartyRoomCardProps {
  roomId: number;
  summary: PartyRoomSummary;
}

const PartyRoomCard = ({ roomId, summary }: PartyRoomCardProps) => {
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
                // src={summary?.src ?? '/images/ETC/PlaylistThumbnail.png'}
                src={'/images/ETC/PlaylistThumbnail.png'}
                alt={summary.name}
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
              {summary.name}
            </Typography>
          </div>
          <div className='bg-gray-600 h-[1px]' />
          <div className='items-center justify-between flexRow'>
            <Participants
              count={summary.participantTotalCount}
              participants={summary.participants}
            />
            <PFInfoOutline width={24} height={24} />
          </div>
        </div>
      </Link>
    </BackdropBlurContainer>
  );
};

export default PartyRoomCard;

'use client';
import Image from 'next/image';
import Link from 'next/link';

import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { cn } from '@/shared/lib/functions/cn';
import { BackdropBlurContainer } from '@/shared/ui/components/backdrop-blur-container';
import { Typography } from '@/shared/ui/components/typography';
import { PFInfoOutline } from '@/shared/ui/icons';
import Crews from './crews.component';
import { getPartyroomCardBackdropProps } from './partyroom-card-backdrop';

interface PartyroomCardProps {
  roomId: number;
  summary: PartyroomSummary;
  onClose?: () => void;
}

const PartyroomCard = ({ roomId, summary, onClose }: PartyroomCardProps) => {
  // 룸 A→B 전환은 서버의 tryEnter(B)가 A를 자동 퇴장시키므로,
  // 클라이언트는 별도의 백엔드 exit을 호출하지 않고 이동만 한다.
  const handleClick = () => {
    onClose?.();
  };

  return (
    <BackdropBlurContainer
      src={summary.playback?.thumbnailImage}
      {...getPartyroomCardBackdropProps(summary.playback?.thumbnailImage)}
    >
      <Link
        href={`/parties/${roomId}?source=list`}
        onClick={handleClick}
        className='h-full flexCol justify-between gap-[61px] py-6 px-7 backdrop-blur-sm bg-backdrop-black/80'
      >
        <Typography type='title2' className='text-gray-50'>
          {summary.title}
        </Typography>
        <div className='gap-4 flexCol max-w-full'>
          {summary.playback && (
            <div className='flex-1 max-w-full min-w-0 flexRowCenter gap-[12px] rounded'>
              <div className='w-[80px] h-[44px] bg-gray-700'>
                <Image
                  priority
                  src={summary.playback.thumbnailImage}
                  alt={'playback thumbnail'}
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
                {summary.playback.name}
              </Typography>
            </div>
          )}
          <div className='bg-gray-600 h-[1px]' />
          <div className='items-center justify-between flexRow'>
            <Crews
              count={summary.crewCount}
              icons={summary.primaryIcons.map((avatar) => avatar.avatarIconUri)}
            />
            <PFInfoOutline width={24} height={24} role='presentation' />
          </div>
        </div>
      </Link>
    </BackdropBlurContainer>
  );
};

export default PartyroomCard;

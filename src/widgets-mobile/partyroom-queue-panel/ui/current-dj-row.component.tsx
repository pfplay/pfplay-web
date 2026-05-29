'use client';
import { FC } from 'react';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  dj: { crewId: number; nickname: string; playlistName?: string };
  playback: { name?: string; duration?: string };
}

const CurrentDjRow: FC<Props> = ({ dj, playback }) => (
  <div className='flex flex-col gap-3 px-4 py-3 border-b border-gray-800'>
    <div className='flex items-center gap-3'>
      <Typography type='detail2' className='text-gray-400'>
        현재 DJ
      </Typography>
      <Typography type='body3'>{dj.nickname}</Typography>
    </div>
    {playback?.name && (
      <div className='flex items-center justify-between gap-2'>
        <Typography type='body3' className='truncate flex-1'>
          {playback.name}
        </Typography>
        <Typography type='detail2' className='text-gray-400'>
          {playback.duration}
        </Typography>
      </div>
    )}
  </div>
);

export default CurrentDjRow;

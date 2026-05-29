'use client';
import { FC } from 'react';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  order: number;
  dj: { crewId: number; nickname: string; playlistName?: string };
  isMe: boolean;
  onChangePlaylist: () => void;
}

const QueueListItem: FC<Props> = ({ order, dj, isMe, onChangePlaylist }) => (
  <li className='flex items-center gap-3 px-4 py-3 border-b border-gray-800'>
    <Typography type='detail2' className='text-gray-400 w-6'>
      {order}.
    </Typography>
    <div className='flex-1 min-w-0'>
      <Typography type='body3'>
        {dj.nickname}
        {isMe && ' (Me)'}
      </Typography>
      <Typography type='detail2' className='text-gray-400 truncate'>
        {dj.playlistName}
      </Typography>
    </div>
    {isMe && (
      <TextButton data-testid='queue-item-change-playlist' onClick={onChangePlaylist}>
        변경
      </TextButton>
    )}
  </li>
);

export default QueueListItem;

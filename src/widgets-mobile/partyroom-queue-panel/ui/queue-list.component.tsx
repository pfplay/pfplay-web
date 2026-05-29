'use client';
import { FC } from 'react';
import { Typography } from '@/shared/ui/components/typography';
import QueueListItem from './queue-list-item.component';

interface Dj {
  crewId: number;
  nickname: string;
  playlistName?: string;
  orderNumber: number;
}

interface Props {
  djs: Dj[];
  myCrewId?: number;
  onChangePlaylist: () => void;
}

const QueueList: FC<Props> = ({ djs, myCrewId, onChangePlaylist }) => {
  if (djs.length === 0) {
    return (
      <Typography type='detail2' className='text-gray-400 text-center p-4'>
        큐 비어있음
      </Typography>
    );
  }
  const sorted = [...djs].sort((a, b) => a.orderNumber - b.orderNumber);
  // 첫 번째는 CurrentDjRow 가 표시 — 큐 리스트는 1번 (대기 1순위) 부터
  const queue = sorted.slice(1);
  return (
    <ul>
      {queue.map((dj, i) => (
        <QueueListItem
          key={dj.crewId}
          order={i + 1}
          dj={dj}
          isMe={dj.crewId === myCrewId}
          onChangePlaylist={onChangePlaylist}
        />
      ))}
    </ul>
  );
};

export default QueueList;

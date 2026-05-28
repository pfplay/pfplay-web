'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { cn } from '@/shared/lib/functions/cn';

interface Props {
  roomId: number;
  summary: PartyroomSummary;
  onClose?: () => void;
}

/**
 * 모바일 로비 1컬럼 카드 (§4.4).
 *
 * - 풀폭 + 썸네일(now-playing) + 룸 제목 + 인원 + now-playing 1줄
 * - Link href: `/parties/${roomId}?source=list` (데스크탑 카드와 동일 attribution 패턴)
 * - DJ 닉네임은 list 엔드포인트가 제공하지 않음 → 표시 X (룸 진입 후 확인)
 */
const MobilePartyroomCard: FC<Props> = ({ roomId, summary, onClose }) => {
  return (
    <Link
      href={`/parties/${roomId}?source=list`}
      onClick={onClose}
      className={cn(
        'block w-full rounded-xl overflow-hidden bg-gray-900',
        'transition-colors hover:bg-gray-800 active:bg-gray-800'
      )}
    >
      <div className='relative w-full aspect-video bg-gray-800'>
        {summary.playback?.thumbnailImage ? (
          <Image
            src={summary.playback.thumbnailImage}
            alt={summary.playback.name}
            fill
            className='object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-600 text-xs'>
            준비 중
          </div>
        )}
      </div>
      <div className='p-4 space-y-1.5'>
        <h3 className='text-base font-semibold text-white truncate'>{summary.title}</h3>
        <p className='text-xs text-gray-400'>👥 {summary.crewCount}명</p>
        {summary.playbackActivated && summary.playback ? (
          <p className='text-xs text-gray-500 truncate'>{summary.playback.name}</p>
        ) : (
          <p className='text-xs text-gray-600'>재생 중인 곡이 없어요</p>
        )}
      </div>
    </Link>
  );
};

export default MobilePartyroomCard;

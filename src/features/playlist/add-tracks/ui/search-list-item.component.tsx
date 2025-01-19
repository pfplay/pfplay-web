import Image from 'next/image';
import { ReactNode } from 'react';
import { Music } from '@/shared/api/http/types/playlists';
import { safeDecodeURI } from '@/shared/lib/functions/safe-decode-uri';
import { Typography } from '@/shared/ui/components/typography';

type SearchListItemProps = {
  music: Pick<Music, 'videoTitle' | 'runningTime' | 'thumbnailUrl'>;
  Suffix: ReactNode;
};

export default function SearchListItem({
  music: { videoTitle, runningTime, thumbnailUrl },
  Suffix,
}: SearchListItemProps) {
  return (
    <div className='flex items-center gap-[32px]'>
      <div className='flex-1 flex items-center gap-[12px]'>
        <Image src={thumbnailUrl} alt='Video Thumbnail' width={60} height={33.75} />
        {/* 일본어, 중국어 등의 정상 렌더링을 위해 url encode, title decode 해줘야 함 */}
        <Typography className='flex-1 text-left mx-3'>{safeDecodeURI(videoTitle)}</Typography>
        <Typography>{formatDuration(runningTime)}</Typography>
      </div>

      {Suffix}
    </div>
  );
}

/**
 * Format duration to 'mm:ss'
 */
function formatDuration(duration: string) {
  const DELEMETER = ':';

  const times = duration.split(DELEMETER);
  if (!times.length) return '00:00';

  const formatTime = (time: string) => time.padStart(2, '0');

  return times.map(formatTime).join(DELEMETER);
}

import { ReactNode } from 'react';
import { convertSearchMusicToPreview } from '@/entities/music-preview';
import { ThumbnailWithPreview } from '@/entities/music-preview/index.ui';
import { Music } from '@/shared/api/http/types/playlists';
import { safeDecodeURI } from '@/shared/lib/functions/safe-decode-uri';
import { Typography } from '@/shared/ui/components/typography';

type SearchListItemProps = {
  music: Music;
  Suffix: ReactNode;
};

export default function SearchListItem({ music, Suffix }: SearchListItemProps) {
  // 미리보기용 트랙 데이터 변환
  const previewTrack = convertSearchMusicToPreview(music);

  return (
    <div className='flex items-center gap-[32px]'>
      <div className='flex-1 flex items-center gap-[12px]'>
        {/* 미리보기 기능이 통합된 썸네일 */}
        <ThumbnailWithPreview
          previewTrack={previewTrack}
          thumbnailSrc={music.thumbnailUrl}
          thumbnailAlt='Video Thumbnail'
          width={60}
          height={33.75}
          imageClassName='object-cover'
        />

        {/* 일본어, 중국어 등의 정상 렌더링을 위해 url encode, title decode 해줘야 함 */}
        <Typography className='flex-1 text-left mx-3'>{safeDecodeURI(music.videoTitle)}</Typography>
        <Typography>{formatDuration(music.runningTime)}</Typography>
      </div>

      {Suffix}
    </div>
  );
}

/**
 * Format duration to 'mm:ss'
 */
function formatDuration(duration: string) {
  const DELIMITER = ':';

  const times = duration.split(DELIMITER);
  if (!times.length) return '00:00';

  const formatTime = (time: string) => time.padStart(2, '0');

  return times.map(formatTime).join(DELIMITER);
}

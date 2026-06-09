'use client';
import { FC } from 'react';
import { Music } from '@/shared/api/http/types/playlists';
import { safeDecodeURI } from '@/shared/lib/functions/safe-decode-uri';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFPlayCircleFilled, PFAdd } from '@/shared/ui/icons';

interface Props {
  music: Music;
  onPreview: (music: Music) => void;
  onAdd: (music: Music) => void;
  addPending: boolean;
}

/**
 * 모바일 음악 검색 결과 단건 카드.
 * 제목·재생시간 노출 + ▶ 미리듣기 / [+] 추가 액션.
 * Music 도메인에는 artist 필드가 없으므로 (videoTitle 자체에 아티스트가 합쳐진 형태) 제목/재생시간만 노출.
 */
const SearchListItem: FC<Props> = ({ music, onPreview, onAdd, addPending }) => {
  return (
    <li className='flex items-center gap-3 px-5 py-3 border-b border-gray-800'>
      <div className='flex-1 min-w-0'>
        <Typography type='body3' className='truncate'>
          {safeDecodeURI(music.videoTitle)}
        </Typography>
        <Typography type='detail2' className='text-gray-400'>
          {music.runningTime}
        </Typography>
      </div>
      <TextButton
        data-testid={`search-item-preview-${music.videoId}`}
        onClick={() => onPreview(music)}
        aria-label={`${music.videoTitle} 미리듣기`}
        Icon={<PFPlayCircleFilled width={20} height={20} aria-hidden='true' />}
      />
      <TextButton
        data-testid={`search-item-add-${music.videoId}`}
        onClick={() => onAdd(music)}
        disabled={addPending}
        aria-label={`${music.videoTitle} 추가`}
        Icon={<PFAdd width={20} height={20} aria-hidden='true' />}
      />
    </li>
  );
};

export default SearchListItem;

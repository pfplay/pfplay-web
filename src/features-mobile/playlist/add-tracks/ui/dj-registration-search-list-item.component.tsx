'use client';

import { FC } from 'react';
import { Music } from '@/shared/api/http/types/playlists';
import { safeDecodeURI } from '@/shared/lib/functions/safe-decode-uri';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  music: Music;
  onSelect: (music: Music) => void;
  selected?: boolean;
}

const DjRegistrationSearchListItem: FC<Props> = ({ music, onSelect, selected = false }) => (
  <li
    role='button'
    tabIndex={0}
    aria-pressed={selected}
    onClick={() => onSelect(music)}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') onSelect(music);
    }}
    data-testid={`register-track-item-${music.videoId}`}
    className={`flex items-center gap-3 rounded-xl border px-0 py-3 transition-colors ${
      selected ? 'border-[#500F14] bg-[#500F14] px-3' : 'border-transparent'
    }`}
  >
    <img
      src={music.thumbnailUrl || '/images/ETC/PlaylistThumbnail.png'}
      alt={music.videoTitle}
      className='h-[44px] w-[80px] shrink-0 rounded object-cover bg-gray-700'
    />
    <Typography className='line-clamp-2 min-w-0 flex-1 text-[16px] leading-[1.45]'>
      {safeDecodeURI(music.videoTitle)}
    </Typography>
    <Typography className='shrink-0 text-[16px] text-gray-300'>{music.runningTime}</Typography>
  </li>
);

export default DjRegistrationSearchListItem;

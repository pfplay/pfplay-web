'use client';

import { FC } from 'react';
import { Music } from '@/shared/api/http/types/playlists';
import { safeDecodeURI } from '@/shared/lib/functions/safe-decode-uri';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFPlayCircleFilled, PFAdd } from '@/shared/ui/icons';

interface Props {
  music: Music;
  onPreview: (music: Music) => void;
  onAdd: (music: Music) => void;
  addPending: boolean;
}

const PlaylistSearchListItem: FC<Props> = ({ music, onPreview, onAdd, addPending }) => {
  const t = useI18n();

  return (
    <li className='flex items-center gap-3 px-5 py-3 border-b border-gray-800'>
      <img
        src={music.thumbnailUrl || '/images/ETC/PlaylistThumbnail.png'}
        alt={music.videoTitle}
        className='w-[64px] h-[36px] shrink-0 rounded object-cover bg-gray-700'
      />
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
        aria-label={`${music.videoTitle} ${t.playlist.btn.preview_song}`}
        Icon={<PFPlayCircleFilled width={20} height={20} aria-hidden='true' />}
      />
      <TextButton
        data-testid={`search-item-add-${music.videoId}`}
        onClick={() => onAdd(music)}
        disabled={addPending}
        aria-label={`${music.videoTitle} ${t.playlist.btn.add_song}`}
        Icon={<PFAdd width={20} height={20} aria-hidden='true' />}
      />
    </li>
  );
};

export default PlaylistSearchListItem;

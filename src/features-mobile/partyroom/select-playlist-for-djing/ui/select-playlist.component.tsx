'use client';
import { FC } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { processI18nString } from '@/shared/lib/localization/renderer/processors/variable-processor-util';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  playlists: Playlist[];
  onSelect: (playlist: Playlist) => void;
  onAddTracksForEmpty: (playlist: Playlist) => void;
}

const SelectPlaylist: FC<Props> = ({ playlists, onSelect, onAddTracksForEmpty }) => {
  const t = useI18n();
  return (
    <ul className='flex flex-col divide-y divide-gray-800'>
      {playlists.map((p) => {
        const empty = p.musicCount === 0;
        return (
          <li key={p.id} className='flex items-center justify-between gap-3 px-4 py-4'>
            <button
              type='button'
              data-testid={`mobile-playlist-card-${p.id}`}
              onClick={empty ? undefined : () => onSelect(p)}
              disabled={empty}
              className={cn('flex-1 text-left min-w-0', empty && 'cursor-not-allowed opacity-50')}
            >
              <Typography type='body3' className='truncate'>
                {p.name}
              </Typography>
              <Typography type='detail2' className='text-gray-400'>
                {processI18nString(t.partyroom.queue.song_count, { count: String(p.musicCount) })}
              </Typography>
            </button>
            {empty && (
              <TextButton
                data-testid={`mobile-playlist-card-${p.id}-add-tracks`}
                onClick={() => onAddTracksForEmpty(p)}
                className='text-primary-300 px-2 py-1'
                typographyType='caption1'
              >
                {t.partyroom.queue.add_tracks_cta}
              </TextButton>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default SelectPlaylist;

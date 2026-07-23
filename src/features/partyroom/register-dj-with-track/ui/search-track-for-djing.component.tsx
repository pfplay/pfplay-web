'use client';
import { useCallback, useState } from 'react';
import { useSearchMusics } from '@/features/playlist/add-tracks/api/use-search-musics.query';
import SearchInput from '@/features/playlist/add-tracks/ui/search-input.component';
import SearchListItem from '@/features/playlist/add-tracks/ui/search-list-item.component';
import { Music } from '@/shared/api/http/types/playlists';
import { track } from '@/shared/lib/analytics';
import { cn } from '@/shared/lib/functions/cn';
import { safeDecodeURI } from '@/shared/lib/functions/safe-decode-uri';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import LoadingPanel from '@/shared/ui/components/loading/loading-panel.component';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFArrowLeft, PFClose } from '@/shared/ui/icons';

type Props = {
  onSelectTrack: (music: Music) => void;
  onBackToDjingDialog: () => void;
  onCloseAll: () => void;
};

export default function SearchTrackForDjing({
  onSelectTrack,
  onBackToDjingDialog,
  onCloseAll,
}: Props) {
  const t = useI18n();
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Music>();
  const { data: musics, isFetching } = useSearchMusics(search);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setSelectedTrack(undefined);
    if (value) {
      track('Music Searched', { query: value });
    }
  }, []);

  const hasNoResult = !isFetching && !musics?.length;

  return (
    <div className='flexCol text-start'>
      <header className='flex items-center gap-7 px-[40px] pt-[36px] pb-[24px]'>
        <TextButton
          onClick={onBackToDjingDialog}
          Icon={<PFArrowLeft width={24} height={24} />}
          data-testid='djing-track-search-back'
        />
        <Typography type='title2'>{t.playlist.btn.add_song}</Typography>
        <SearchInput onSearch={handleSearch} />
        <TextButton
          onClick={onCloseAll}
          Icon={<PFClose width={24} height={24} />}
          data-testid='djing-track-search-close'
        />
      </header>

      <div className='h-[420px] overflow-y-auto px-[40px]'>
        {isFetching && <LoadingPanel />}

        {hasNoResult && (
          <div className='h-full flexRowCenter'>
            <Typography type='body2' className='text-gray-300'>
              {t.dj.para.search_song_to_dj}
            </Typography>
          </div>
        )}

        {!isFetching &&
          musics?.map((music) => {
            const isSelected = selectedTrack?.videoId === music.videoId;

            return (
              <div
                key={music.videoId}
                role='button'
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedTrack(music)}
                className={cn(
                  'my-1 rounded border px-[12px] py-[12px] cursor-pointer transition-colors',
                  isSelected
                    ? 'border-red-300 bg-red-500/40'
                    : 'border-transparent hover:bg-gray-800'
                )}
                data-testid='djing-track-item'
              >
                <SearchListItem music={music} Suffix={null} />
              </div>
            );
          })}
      </div>

      <footer className='flex items-center justify-between gap-4 border-t border-gray-700 px-[40px] py-[24px]'>
        {selectedTrack ? (
          <div className='flexCol gap-1 min-w-0'>
            <Typography type='body1' overflow='ellipsis'>
              {safeDecodeURI(selectedTrack.videoTitle)}
            </Typography>
            <Typography type='detail1' className='text-gray-300'>
              {t.dj.para.start_djing_with_this_song}
            </Typography>
          </div>
        ) : (
          <Typography type='body2' className='text-gray-300'>
            {t.dj.para.select_song_to_dj}
          </Typography>
        )}

        <Button
          size='lg'
          disabled={!selectedTrack}
          onClick={() => selectedTrack && onSelectTrack(selectedTrack)}
          data-testid='djing-track-confirm'
        >
          {t.dj.btn.register_with_this_song}
        </Button>
      </footer>
    </div>
  );
}

'use client';
import { FC, useState } from 'react';
import { useQuickRegisterMeToQueue } from '@/features/partyroom/register-dj-with-track/api/use-quick-register-me-to-queue.mutation';
import DjRegistrationMusicSearch from '@/features-mobile/playlist/add-tracks/ui/dj-registration-music-search.component';
import { Music } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useFullscreenSheet } from '../lib/use-fullscreen-sheet.hook';

interface Props {
  partyroomId: number;
}

const RegisterTrackSheet: FC<Props> = ({ partyroomId }) => {
  const t = useI18n();
  const { closeAll } = useFullscreenSheet();
  const { mutate, isPending } = useQuickRegisterMeToQueue();
  const [selected, setSelected] = useState<Music>();

  const register = () => {
    if (!selected) return;
    mutate(
      {
        partyroomId,
        name: selected.videoTitle,
        linkId: selected.videoId,
        duration: selected.runningTime,
        thumbnailImage: selected.thumbnailUrl,
      },
      { onSuccess: () => closeAll() }
    );
  };

  return (
    <div className='relative flex h-full min-h-0 flex-col'>
      <div className='min-h-0 flex-1'>
        <DjRegistrationMusicSearch
          inputTestId='register-track-search-input'
          selectedVideoId={selected?.videoId}
          onSelect={setSelected}
        />
      </div>
      <footer className='shrink-0 border-t border-gray-800 bg-black px-4 py-4'>
        <button
          type='button'
          disabled={!selected || isPending}
          onClick={register}
          data-testid='register-track-submit'
          className='h-[56px] w-full rounded-lg bg-red-500 text-[18px] font-bold text-white disabled:bg-gray-800 disabled:text-gray-600'
        >
          {t.dj.btn.register_with_this_song}
        </button>
      </footer>
    </div>
  );
};

export default RegisterTrackSheet;

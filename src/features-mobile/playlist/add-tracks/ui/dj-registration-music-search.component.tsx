'use client';

import { FC } from 'react';
import { Music } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import DjRegistrationSearchListItem from './dj-registration-search-list-item.component';
import MusicSearch from './music-search.component';

interface Props {
  onSelect: (music: Music) => void;
  selectedVideoId?: string;
  inputTestId?: string;
}

const DjRegistrationMusicSearch: FC<Props> = ({
  onSelect,
  selectedVideoId,
  inputTestId = 'register-track-search-input',
}) => {
  const t = useI18n();

  return (
    <MusicSearch
      placeholder={t.playlist.para.search_url}
      inputTestId={inputTestId}
      renderItem={(music) => (
        <DjRegistrationSearchListItem
          key={music.videoId}
          music={music}
          selected={music.videoId === selectedVideoId}
          onSelect={onSelect}
        />
      )}
    />
  );
};

export default DjRegistrationMusicSearch;

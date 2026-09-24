'use client';

import { FC } from 'react';
import { Music } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import MusicSearch from './music-search.component';
import PlaylistSearchListItem from './playlist-search-list-item.component';

interface Props {
  onPreview: (music: Music) => void;
  onAdd: (music: Music) => void;
  addPending: boolean;
}

const PlaylistMusicSearch: FC<Props> = ({ onPreview, onAdd, addPending }) => {
  const t = useI18n();

  return (
    <MusicSearch
      placeholder={t.partyroom.queue.sheet_search_placeholder}
      renderItem={(music) => (
        <PlaylistSearchListItem
          key={music.videoId}
          music={music}
          onPreview={onPreview}
          onAdd={onAdd}
          addPending={addPending}
        />
      )}
    />
  );
};

export default PlaylistMusicSearch;

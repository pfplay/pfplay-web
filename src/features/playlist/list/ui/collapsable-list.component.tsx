'use client';
import { ReactElement } from 'react';
import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { CollapseList } from '@/shared/ui/components/collapse-list';

type CollapsibleListProps = {
  musicsRender: (playlist: Playlist) => ReactElement;
};

// TODO: 개발 참조용. 후에 삭제 예정
const CollapsibleList = ({ musicsRender }: CollapsibleListProps) => {
  const t = useI18n();
  const playlistAction = usePlaylistAction();

  return (
    <div className='flexCol gap-3'>
      {playlistAction.list.map((playlist) => (
        <CollapseList
          key={playlist.id}
          title={playlist.name}
          // infoText={replaceVar(t.playlist.title.n_song, { $1: playlist.musicCount })}
          infoText={`${t.playlist.title.n_song}곡`}
          classNames={{
            panel: 'text-gray-200',
          }}
        >
          {musicsRender(playlist)}
        </CollapseList>
      ))}
    </div>
  );
};

export default CollapsibleList;

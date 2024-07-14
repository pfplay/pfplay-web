'use client';
import { ReactElement } from 'react';
import { Disclosure } from '@headlessui/react';
import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { CollapseList } from '@/shared/ui/components/collapse-list';

type CollapsibleListProps = {
  musicsRender: (playlist: Playlist) => ReactElement;
};

const CollapsibleList = ({ musicsRender }: CollapsibleListProps) => {
  const t = useI18n();
  const playlistAction = usePlaylistAction();

  return (
    <div className='flexCol gap-3'>
      {playlistAction.list.map((playlist) => (
        <CollapseList
          key={playlist.id}
          title={playlist.name}
          infoText={replaceVar(t.playlist.title.n_song, { $1: playlist.musicCount })}
        >
          <Disclosure.Panel as='article' className=' text-gray-200'>
            {musicsRender(playlist)}
          </Disclosure.Panel>
        </CollapseList>
      ))}
    </div>
  );
};

export default CollapsibleList;

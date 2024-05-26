import React, { ReactElement } from 'react';
import { Disclosure } from '@headlessui/react';
import { useFetchPlaylists } from '@/features/playlist/list/api/use-fetch-playlist.query';
import { Playlist } from '@/shared/api/types/playlist';
import { CollapseList } from '@/shared/ui/components/collapse-list';

type CollapsableListProps = {
  musicsRender: (playlist: Playlist) => ReactElement;
};

const CollapsableList = ({ musicsRender }: CollapsableListProps) => {
  const { data: playlists } = useFetchPlaylists();

  return (
    <div className='flexCol gap-3'>
      {playlists?.map((playlist) => (
        <CollapseList key={playlist.id} title={playlist.name} infoText={`${playlist.count}곡`}>
          <Disclosure.Panel as='article' className=' text-gray-200'>
            {musicsRender(playlist)}
          </Disclosure.Panel>
        </CollapseList>
      ))}
    </div>
  );
};

export default CollapsableList;

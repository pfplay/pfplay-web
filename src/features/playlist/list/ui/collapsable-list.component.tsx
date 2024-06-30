import { ReactElement } from 'react';
import { Disclosure } from '@headlessui/react';
import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/http/types/playlists';
import { CollapseList } from '@/shared/ui/components/collapse-list';

type CollapsableListProps = {
  musicsRender: (playlist: Playlist) => ReactElement;
};

const CollapsableList = ({ musicsRender }: CollapsableListProps) => {
  const playlistAction = usePlaylistAction();

  return (
    <div className='flexCol gap-3'>
      {playlistAction.list.map((playlist) => (
        <CollapseList key={playlist.id} title={playlist.name} infoText={`${playlist.musicCount}곡`}>
          <Disclosure.Panel as='article' className=' text-gray-200'>
            {musicsRender(playlist)}
          </Disclosure.Panel>
        </CollapseList>
      ))}
    </div>
  );
};

export default CollapsableList;

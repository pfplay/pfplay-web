'use client';
import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/http/types/playlists';
import { VariableProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import ListItem from './list-item.component';

type Props = {
  onClickItem?: (playlist: Playlist) => void;
};

const List = ({ onClickItem }: Props) => {
  const playlistAction = usePlaylistAction();

  return (
    <div className='flexCol gap-3'>
      {playlistAction.list.map((playlist) => (
        <ListItem
          key={playlist.id}
          title={playlist.name}
          InfoText={
            <Trans
              i18nKey='playlist.title.n_song'
              processors={[new VariableProcessor({ count: playlist.musicCount })]}
            />
          }
          onClick={() => onClickItem?.(playlist)}
        />
      ))}
    </div>
  );
};

export default List;

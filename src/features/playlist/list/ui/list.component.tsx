'use client';
import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import ListItem from './list-item.component';

type Props = {
  onClickItem?: (playlist: Playlist) => void;
};

const List = ({ onClickItem }: Props) => {
  const t = useI18n();
  const playlistAction = usePlaylistAction();

  return (
    <div className='flexCol gap-3'>
      {playlistAction.list.map((playlist) => (
        <ListItem
          key={playlist.id}
          title={playlist.name}
          InfoText={replaceVar(t.playlist.title.n_song, { $1: playlist.musicCount })}
          onClick={() => onClickItem?.(playlist)}
        />
      ))}
    </div>
  );
};

export default List;

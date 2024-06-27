import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { PFDelete } from '@/shared/ui/icons';
import Music from './music.component';
import { useFetchPlaylistMusics } from '../api/use-fetch-playlist-musics.query';

type MusicsInPlaylistProps = {
  playlist: Playlist;
};

const MusicsInPlaylist = ({ playlist }: MusicsInPlaylistProps) => {
  const t = useI18n();
  const { data } = useFetchPlaylistMusics(playlist.id, {
    pageNumber: 0,
    pageSize: playlist.musicCount,
  });
  const playlistAction = usePlaylistAction();

  return (
    <div className='flex flex-col gap-3'>
      {data?.content.map((music) => (
        <Music
          key={music.musicId}
          music={music}
          menuItems={[
            {
              onClickItem: () => playlistAction.removeMusics(playlist.id, [music.musicId]),
              label: t.playlist.btn.delete_playlist,
              Icon: <PFDelete />,
            },
            // TODO: 구현되면 주석 해제
            // {
            //   onClickItem: () => alert('Not Impl'),
            //   label: t.playlist.btn.move_playlist,
            //   Icon: <PFAddPlaylist />,
            // },
          ]}
        />
      ))}
    </div>
  );
};

export default MusicsInPlaylist;

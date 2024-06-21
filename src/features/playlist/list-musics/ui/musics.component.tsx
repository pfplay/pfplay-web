import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/types/playlist';
import { PFAddPlaylist, PFDelete } from '@/shared/ui/icons';
import Music from './music.component';
import { useFetchPlaylistMusics } from '../api/use-fetch-playlist-musics.query';

type MusicsInPlaylistProps = {
  playlist: Playlist;
};

const MusicsInPlaylist = ({ playlist }: MusicsInPlaylistProps) => {
  const { data } = useFetchPlaylistMusics(playlist.id, {
    pageSize: playlist.count,
  });
  const playlistAction = usePlaylistAction();

  return (
    <div className='flex flex-col gap-3'>
      {data?.musicList?.map((music) => (
        <Music
          key={music.musicId}
          music={music}
          menuItems={[
            {
              onClickItem: () => playlistAction.removeMusics([music.musicId]),
              label: '재생목록에서 삭제',
              Icon: <PFDelete />,
            },
            {
              onClickItem: () => alert('Not Impl'),
              label: '다른 재생목록으로 이동',
              Icon: <PFAddPlaylist />,
            },
          ]}
        />
      ))}
    </div>
  );
};

export default MusicsInPlaylist;

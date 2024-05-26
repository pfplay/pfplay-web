import { Playlist } from '@/shared/api/types/playlist';
import { PFAddPlaylist, PFDelete } from '@/shared/ui/icons';
import Music from './music.component';
import { useFetchPlaylistMusics } from '../api/use-fetch-playlist-musics.query';

type MusicsInPlaylistProps = {
  playlist: Playlist;
  onDeleteFromList: (musicId: number) => void;
  onMoveToOtherList: (musicId: number) => void;
};

const MusicsInPlaylist = ({
  playlist,
  onDeleteFromList,
  onMoveToOtherList,
}: MusicsInPlaylistProps) => {
  const { data } = useFetchPlaylistMusics(playlist.id, {
    pageSize: playlist.count,
  });

  return (
    <div className='flex flex-col gap-3'>
      {data?.musicList?.map((music) => (
        <Music
          key={music.musicId}
          music={music}
          menuItems={[
            {
              onClickItem: () => onDeleteFromList(music.musicId),
              label: '재생목록에서 삭제',
              Icon: <PFDelete />,
            },
            {
              onClickItem: () => onMoveToOtherList(music.musicId),
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

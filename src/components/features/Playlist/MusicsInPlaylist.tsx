import { usePlaylistMusicsQuery } from '@/api/query-temp/playlist/usePlaylistMusicsQuery';
import PlayListItem from '@/components/shared/atoms/PlayListItem';
import { mockMenuConfig } from '@/constants/__mock__/mockMenuConfig';

type MusicsInPlaylistProps = {
  listId: number;
  size: number;
};
export const MusicsInPlaylist = ({ listId, size }: MusicsInPlaylistProps) => {
  const { data } = usePlaylistMusicsQuery(listId, { pageSize: size });

  const musics = data?.musicList || [];
  return (
    <div className='flex flex-col gap-3'>
      {musics.map(({ duration, musicId, name, thumbnailImage }) => (
        <PlayListItem
          key={musicId}
          playListItemConfig={{
            duration,
            id: musicId,
            title: name,
            alt: name,
            src: thumbnailImage,
          }}
          menuItemList={mockMenuConfig}
        />
      ))}
    </div>
  );
};

export default MusicsInPlaylist;

import { usePlaylistMusicsQuery } from '@/api/query-temp/playlist/usePlaylistMusicsQuery';
import PlayListItem from '@/components/shared/atoms/PlayListItem';
import { PFAddPlaylist, PFDelete } from '@/components/shared/icons';

type MusicsInPlaylistProps = {
  listId: number;
  size: number;

  onDeleteFromList?: (musicId: number) => void;
  onMoveToOtherList?: (musicId: number) => void;
};
export const MusicsInPlaylist = ({
  listId,
  size,
  onDeleteFromList,
  onMoveToOtherList,
}: MusicsInPlaylistProps) => {
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
          menuItemList={[
            {
              onClickItem: () => onDeleteFromList?.(musicId),
              label: '재생목록에서 삭제',
              Icon: <PFDelete />,
            },
            {
              onClickItem: () => onMoveToOtherList?.(musicId),
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

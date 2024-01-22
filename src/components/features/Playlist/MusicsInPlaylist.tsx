import { usePlaylistMusicsQuery } from '@/api/query-temp/playlist/usePlaylistMusicsQuery';
import PlayListItem from '@/components/shared/atoms/PlayListItem';
import { PFAddPlaylist, PFDelete } from '@/components/shared/icons';

type MusicsInPlaylistProps = {
  listId: number;
  size: number;

  onDeleteFromList?: (listId: number) => void;
  onMoveToOtherList?: (listId: number) => void;
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
              onClickItem: () => onDeleteFromList?.(listId),
              label: '재생목록에서 삭제',
              icon: <PFDelete />,
            },
            {
              onClickItem: () => onMoveToOtherList?.(listId),
              label: '다른 재생목록으로 이동',
              icon: <PFAddPlaylist />,
            },
          ]}
        />
      ))}
    </div>
  );
};

export default MusicsInPlaylist;

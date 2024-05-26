import { useState } from 'react';
import { AddPlaylistButton } from '@/features/playlist/add';
import { AddMusicsToPlaylistButton } from '@/features/playlist/add-musics';
import { useEditPlaylistDialog } from '@/features/playlist/edit';
import { CollapsablePlaylists, EditablePlaylists } from '@/features/playlist/list';
import { MusicsInPlaylist } from '@/features/playlist/list-musics';
import { RemovePlaylistButton } from '@/features/playlist/remove';
import { useDeletePlaylistMusic } from '@/features/playlist/remove-musics';
import { Drawer } from '@/shared/ui/components/drawer';
import { TextButton } from '@/shared/ui/components/text-button';

interface MyPlaylistProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

// TODO: 별도 위젯으로 분리
const MyPlaylist = ({ drawerOpen, setDrawerOpen }: MyPlaylistProps) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<number[]>([]);

  const { mutate: deletePlaylistMusic } = useDeletePlaylistMusic();
  const openEditPlaylistDialog = useEditPlaylistDialog();

  const handleEditConfirm = () => {
    setEditMode(false);
  };
  const handleDeleteMusicFromList = (musicId: number) => {
    deletePlaylistMusic([musicId]);
  };
  const handleMoveMusicToOtherList = () => {
    // TODO: API 연동 필요
    alert('API 연동 필요');
  };

  return (
    <Drawer title='내 플레이리스트' drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
      <div className='flexRow justify-between items-center mt-10 mb-6'>
        {editMode ? (
          <>
            <RemovePlaylistButton targetIds={selectedPlaylistIds} />
            <TextButton className='text-red-300' onClick={handleEditConfirm}>
              완료
            </TextButton>
          </>
        ) : (
          <>
            <div className='flexRow gap-3'>
              <AddMusicsToPlaylistButton />
              <AddPlaylistButton />
            </div>
            <TextButton onClick={() => setEditMode(true)}>설정</TextButton>
          </>
        )}
      </div>

      {editMode ? (
        <EditablePlaylists
          onEditItem={openEditPlaylistDialog}
          onChangeSelectedItem={setSelectedPlaylistIds}
        />
      ) : (
        <CollapsablePlaylists
          musicsRender={(playlist) => (
            <MusicsInPlaylist
              playlist={playlist}
              onDeleteFromList={handleDeleteMusicFromList}
              onMoveToOtherList={handleMoveMusicToOtherList}
            />
          )}
        />
      )}
    </Drawer>
  );
};

export default MyPlaylist;

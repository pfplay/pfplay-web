import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { useDeletePlaylistMutation } from '@/api/query-temp/playlist/useDeletePlaylistMutation';
import { usePlaylistQuery } from '@/api/query-temp/playlist/usePlaylistQuery';
import CollapseList from '@/components/shared/CollapseList';
import Dialog from '@/components/shared/Dialog';
import Drawer from '@/components/shared/Drawer';
import Button from '@/components/shared/atoms/Button';
import TextButton from '@/components/shared/atoms/TextButton';
import { PFAdd, PFDelete } from '@/components/shared/icons';
import { useDialog } from '@/hooks/useDialog';
import EditablePlaylist from '../../Playlist/EditablePlaylist';
import MusicsInPlaylist from '../../Playlist/MusicsInPlaylist';
import PlaylistCreateForm from '../../Playlist/PlaylistCreateForm';
import PlaylistUpdateForm from '../../Playlist/PlaylistUpdateForm';
import YoutubeSearch from '../../Playlist/YoutubeSearch';

interface MyPlaylistProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const MyPlaylist = ({ drawerOpen, setDrawerOpen }: MyPlaylistProps) => {
  const { openDialog } = useDialog();

  const { data: playlist } = usePlaylistQuery();

  const [editMode, setEditMode] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<number[]>([]);

  const { mutate: deletePlaylist } = useDeletePlaylistMutation();

  const handleAddList = () => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <PlaylistCreateForm onCancel={onCancel} />,
    }));
  };

  const handleUpdateList = (listId: number) => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <PlaylistUpdateForm listId={listId} onCancel={onCancel} />,
    }));
  };

  const handleDeleteList = () => {
    openDialog((_, onCancel) => ({
      title: '정말 선택 항목을\n 리스트에서 삭제하시겠어요?',
      Body: (
        <Dialog.ButtonGroup>
          <Dialog.Button color='secondary' onClick={onCancel}>
            취소
          </Dialog.Button>
          <Dialog.Button
            onClick={() =>
              deletePlaylist(selectedPlaylistIds, {
                onSuccess: () => {
                  onCancel?.();
                },
              })
            }
          >
            확인
          </Dialog.Button>
        </Dialog.ButtonGroup>
      ),
      // Body: <PlaylistCreateForm onCancel={onCancel} />,
    }));
  };
  const handleAddMusic = () => {
    openDialog((_, onClose) => ({
      classNames: { container: 'px-[40px] pt-[36px] w-[800px] bg-black border-none' },
      Body: <YoutubeSearch onClose={onClose} />,
      hideDim: true,
    }));
  };

  const handleEditConfirm = () => {
    setEditMode(false);
  };

  const handleDeleteMusicFromList = () => {
    // TODO: API 연동 필요
    alert('API 연동 필요');
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
            <Button
              size='sm'
              Icon={<PFDelete />}
              variant='outline'
              color='secondary'
              disabled={selectedPlaylistIds.length === 0}
              onClick={handleDeleteList}
            >
              삭제
            </Button>
            <TextButton className='text-red-300' onClick={handleEditConfirm}>
              완료
            </TextButton>
          </>
        ) : (
          <>
            <div className='flexRow gap-3'>
              <Button
                size='sm'
                variant='outline'
                color='secondary'
                Icon={<PFAdd />}
                onClick={handleAddMusic}
              >
                곡 추가
              </Button>
              <Button
                size='sm'
                variant='outline'
                color='secondary'
                Icon={<PFAdd />}
                onClick={handleAddList}
              >
                리스트 추가
              </Button>
            </div>
            <TextButton onClick={() => setEditMode(true)}>설정</TextButton>
          </>
        )}
      </div>

      {editMode ? (
        <EditablePlaylist
          items={playlist}
          onChangeSelectedPlaylist={setSelectedPlaylistIds}
          onEditPlaylistName={handleUpdateList}
        />
      ) : (
        <div className='flexCol gap-3'>
          {playlist?.map(({ id, name, count }) => (
            <CollapseList key={id} title={name} infoText={`${count}곡`}>
              <Disclosure.Panel as='article' className=' text-gray-200'>
                <MusicsInPlaylist
                  listId={id}
                  size={count}
                  onDeleteFromList={handleDeleteMusicFromList}
                  onMoveToOtherList={handleMoveMusicToOtherList}
                />
              </Disclosure.Panel>
            </CollapseList>
          ))}
        </div>
      )}
    </Drawer>
  );
};

export default MyPlaylist;

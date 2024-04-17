import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { useDeletePlaylistMusic } from '@/api/react-query/playlist/use-delete-playlist-music.mutation';
import { useDeletePlaylist } from '@/api/react-query/playlist/use-delete-playlist.mutation';
import { useFetchPlaylist } from '@/api/react-query/playlist/use-fetch-playlist.query';
import EditablePlaylist from '@/components/features/playlist/editable-playlist.component';
import MusicsInPlaylist from '@/components/features/playlist/musicsIn-playlist.component';
import PlaylistCreateForm from '@/components/features/playlist/playlist-create-form.component';
import PlaylistUpdateFormComponent from '@/components/features/playlist/playlist-update-form.component';
import YoutubeSearch from '@/components/features/playlist/youtube-search.component';
import Button from '@/shared/ui/components/button/button.component';
import CollapseList from '@/shared/ui/components/collapse-list/collapse-list.component';
import Dialog from '@/shared/ui/components/dialog/dialog.component';
import { useDialog } from '@/shared/ui/components/dialog/use-dialog.hook';
import Drawer from '@/shared/ui/components/drawer/drawer.component';
import TextButton from '@/shared/ui/components/text-button/text-button.component';
import { PFAdd, PFDelete } from '@/shared/ui/icons';

interface MyPlaylistProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const MyPlaylist = ({ drawerOpen, setDrawerOpen }: MyPlaylistProps) => {
  const { openDialog } = useDialog();

  const { data: playlist } = useFetchPlaylist();

  const [editMode, setEditMode] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<number[]>([]);

  const { mutate: deletePlaylist } = useDeletePlaylist();
  const { mutate: deletePlaylistMusic } = useDeletePlaylistMusic();

  const handleAddList = () => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <PlaylistCreateForm onCancel={onCancel} />,
    }));
  };

  const handleUpdateList = (listId: number) => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <PlaylistUpdateFormComponent listId={listId} onCancel={onCancel} />,
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

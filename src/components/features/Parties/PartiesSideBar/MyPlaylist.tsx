import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { usePlaylistQuery } from '@/api/query-temp/playlist/usePlaylistQuery';
import CollapseList from '@/components/shared/CollapseList';
import Drawer from '@/components/shared/Drawer';
import Button from '@/components/shared/atoms/Button';
import TextButton from '@/components/shared/atoms/TextButton';
import { PFAdd, PFDelete } from '@/components/shared/icons';
import { useDialog } from '@/hooks/useDialog';
import EditablePlaylist from '../../Playlist/EditablePlaylist';
import MusicsInPlaylist from '../../Playlist/MusicsInPlaylist';
import PlaylistCreateForm from '../../Playlist/PlaylistCreateForm';
import YoutubeSearch from '../../Playlist/YoutubeSearch';

interface MyPlaylistProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const MyPlaylist = ({ drawerOpen, setDrawerOpen }: MyPlaylistProps) => {
  const { openDialog } = useDialog();

  const { data: playlist } = usePlaylistQuery();

  const [editMode, setEditMode] = useState(false);

  const handleAddList = () => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <PlaylistCreateForm onCancel={onCancel} />,
    }));
  };
  const handleAddMusic = () => {
    openDialog((_, onClose) => ({
      classNames: { container: 'px-[40px] pt-[36px] w-[800px]' },
      Body: <YoutubeSearch onClose={onClose} />,
    }));
  };

  const handleEditConfirm = () => {
    setEditMode(false);
  };

  return (
    <Drawer title='내 플레이리스트' drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
      <div className='flexRow justify-between items-center mt-10 mb-6'>
        {editMode ? (
          <>
            <Button size='sm' Icon={<PFDelete />} variant='outline' color='secondary'>
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
        <EditablePlaylist items={playlist} />
      ) : (
        <div className='flexCol gap-3'>
          {playlist?.map(({ id, name }) => {
            // FIXME: 리스트 res 에 곡 개수 추가 예정 (서버 작업 필요)
            return (
              <CollapseList key={id} title={name} infoText={`${100}곡`}>
                <Disclosure.Panel as='article' className=' text-gray-200'>
                  <MusicsInPlaylist listId={id} size={100} />
                </Disclosure.Panel>
              </CollapseList>
            );
          })}
        </div>
      )}
    </Drawer>
  );
};

export default MyPlaylist;

import { Disclosure } from '@headlessui/react';
import CollapseList from '@/components/shared/CollapseList';
import Drawer from '@/components/shared/Drawer';
import Button from '@/components/shared/atoms/Button';
import PlayListItem from '@/components/shared/atoms/PlayListItem';
import TextButton from '@/components/shared/atoms/TextButton';
import { PFAdd } from '@/components/shared/icons';
import { mockCollapslistConfig } from '@/constants/__mock__/mockCollapslistConfig';
import { mockMenuConfig } from '@/constants/__mock__/mockMenuConfig';
import { useDialog } from '@/hooks/useDialog';
import PlaylistCreateForm from '../../Playlist/PlaylistCreateForm';

interface MyPlaylistProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const MyPlaylist = ({ drawerOpen, setDrawerOpen }: MyPlaylistProps) => {
  const { openDialog } = useDialog();

  const handleAddList = () => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
      Body: <PlaylistCreateForm onCancel={onCancel} />,
    }));
  };
  return (
    <Drawer title='내 플레이리스트' drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
      <div className='flexRow justify-between items-center mt-10 mb-6'>
        <div className='flexRow gap-3'>
          <Button size='sm' variant='outline' color='secondary' Icon={<PFAdd />}>
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
        <TextButton>설정</TextButton>
      </div>
      <div className='flexCol gap-3'>
        {/* TODO: endpoint 연결 후 조건 부 렌더 */}
        <CollapseList title={'상큼 아이'} infoText='24곡'>
          {/* TODO: endpoint 연결 후 response data로 대체 */}
          {mockCollapslistConfig.playListPanel.map((config) => (
            <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
              <PlayListItem playListItemConfig={config} menuItemList={mockMenuConfig} />
            </Disclosure.Panel>
          ))}
        </CollapseList>
        <CollapseList title={'가사가 좋은 내 취향 인디 노래 모음집'} infoText='24곡'>
          {/* TODO: endpoint 연결 후 response data로 대체 */}
          {mockCollapslistConfig.playListPanel.map((config) => (
            <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
              <PlayListItem playListItemConfig={config} menuItemList={mockMenuConfig} />
            </Disclosure.Panel>
          ))}
        </CollapseList>
      </div>
    </Drawer>
  );
};

export default MyPlaylist;

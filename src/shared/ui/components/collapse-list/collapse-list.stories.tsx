import type { Meta } from '@storybook/react';
import PlaylistItem from '@/features/playlist/list-musics/ui/music.component';
import { fixtureCollapseList } from '@/shared/api/http/__fixture__/collapse-list.fixture';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { UserListItem } from '@/shared/ui/components/user-list-item';
import CollapseList from './collapse-list.component';
import { Tag } from '../tag';

const meta = {
  title: 'base/CollapseList',
  tags: ['autodocs'],
  component: CollapseList,
  decorators: [
    (Story) => <div className='w-full h-72 flexRow justify-end bg-black'>{Story()}</div>,
  ],
} satisfies Meta<typeof CollapseList>;

export default meta;

export const CollapseListDefault = () => {
  return (
    <CollapseList title={'Do you offer technical support?'} classNames={{ panel: 'text-gray-200' }}>
      {fixtureCollapseList.musics.map((music) => (
        <PlaylistItem key={music.musicId} music={music} menuItems={fixtureMenuItems} />
      ))}
    </CollapseList>
  );
};

export const CollapseListAccent = () => {
  return (
    <CollapseList
      variant='accent'
      title={'Do you offer technical support?'}
      classNames={{ panel: 'text-gray-200' }}
    >
      {fixtureCollapseList.musics.map((music) => (
        <PlaylistItem key={music.musicId} music={music} menuItems={fixtureMenuItems} />
      ))}
    </CollapseList>
  );
};

export const CollapseListOutlined = () => {
  return (
    <CollapseList
      variant='outlined'
      title={'Do you offer technical support?'}
      classNames={{ panel: 'text-gray-200' }}
    >
      {fixtureCollapseList.musics.map((music) => (
        <PlaylistItem key={music.musicId} music={music} menuItems={fixtureMenuItems} />
      ))}
    </CollapseList>
  );
};

export const CollapseListForPlaylist = () => {
  return (
    <CollapseList
      PrefixIcon={<Tag value='Tag' variant='outlined' />}
      title={'Do you offer technical support'}
      infoText='24곡'
      classNames={{ panel: 'text-gray-200' }}
    >
      {fixtureCollapseList.musics.map((music) => (
        <PlaylistItem key={music.musicId} music={music} menuItems={fixtureMenuItems} />
      ))}
    </CollapseList>
  );
};

export const CollapseListForUserList = () => {
  return (
    <CollapseList
      title={'Do you offer technical support?'}
      infoText='24곡'
      classNames={{ panel: 'text-gray-200' }}
    >
      {fixtureCollapseList.userListPanel.map((user) => (
        <UserListItem
          key={user.id}
          suffixType='button'
          suffixValue='Click'
          userListItemConfig={user}
          menuItemList={fixtureMenuItems}
          onButtonClick={(id) => console.log(`id: ${id}는 향후 api 연결에 사용될 예정입니다.`)}
        />
      ))}
    </CollapseList>
  );
};

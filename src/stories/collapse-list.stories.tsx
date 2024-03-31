import { Disclosure } from '@headlessui/react';
import type { Meta } from '@storybook/react';
import PlaylistItem from '@/components/shared/atoms/playlist-item.component';
import Tag from '@/components/shared/atoms/tag.component';
import CollapseList from '@/components/shared/collapse-list.component';
import UserListItem from '@/components/shared/user-list-item.component';
import { fixtureCollapseList } from '@/constants/__fixture__/collapse-list.fixture';
import { fixtureMenuItems } from '@/constants/__fixture__/menu-items.fixture';

const meta = {
  title: 'ui/CollapseList',
  tags: ['autodocs'],
  component: CollapseList,
  decorators: [
    (Story) => <div className='w-full h-72 flexRow justify-end bg-black'>{Story()}</div>,
  ],
} satisfies Meta<typeof CollapseList>;

export default meta;

export const CollapseListDefault = () => {
  return (
    <CollapseList title={'Do you offer technical support?'}>
      {fixtureCollapseList.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlaylistItem playListItemConfig={config} menuItemList={fixtureMenuItems} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListAccent = () => {
  return (
    <CollapseList variant='accent' title={'Do you offer technical support?'}>
      {fixtureCollapseList.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlaylistItem playListItemConfig={config} menuItemList={fixtureMenuItems} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListOutlined = () => {
  return (
    <CollapseList variant='outlined' title={'Do you offer technical support?'}>
      {fixtureCollapseList.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlaylistItem playListItemConfig={config} menuItemList={fixtureMenuItems} />
        </Disclosure.Panel>
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
    >
      {fixtureCollapseList.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlaylistItem playListItemConfig={config} menuItemList={fixtureMenuItems} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListForUserlist = () => {
  return (
    <CollapseList title={'Do you offer technical support?'} infoText='24곡'>
      {fixtureCollapseList.userListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <UserListItem
            suffixType='button'
            suffixValue='Click'
            userListItemConfig={config}
            menuItemList={fixtureMenuItems}
            onButtonClick={(id) => console.log(`id: ${id}는 향후 api 연결에 사용될 예정입니다.`)}
          />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

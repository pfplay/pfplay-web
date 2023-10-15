import { Disclosure } from '@headlessui/react';
import type { Meta } from '@storybook/react';
import PlayListItem from '@/components/@shared/@atoms/PlayListItem';
import Tag from '@/components/@shared/@atoms/Tag';
import CollapseList from '@/components/@shared/CollapseList';
import UserListItem from '@/components/@shared/UserListItem';
import { mockCollapslistConfig } from '@/constants/__mock__/mockCollapslistConfig';
import { mockMenuConfig } from '@/constants/__mock__/mockMenuConfig';

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
      {mockCollapslistConfig.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlayListItem playListItemConfig={config} menuItemList={mockMenuConfig} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListAccent = () => {
  return (
    <CollapseList variant='accent' title={'Do you offer technical support?'}>
      {mockCollapslistConfig.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlayListItem playListItemConfig={config} menuItemList={mockMenuConfig} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListOutlined = () => {
  return (
    <CollapseList variant='outlined' title={'Do you offer technical support?'}>
      {mockCollapslistConfig.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlayListItem playListItemConfig={config} menuItemList={mockMenuConfig} />
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
      {mockCollapslistConfig.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlayListItem playListItemConfig={config} menuItemList={mockMenuConfig} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListForUserlist = () => {
  return (
    <CollapseList title={'Do you offer technical support?'} infoText='24곡'>
      {mockCollapslistConfig.userListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <UserListItem
            suffixType='button'
            suffixValue='Click'
            userListItemConfig={config}
            menuItemList={mockMenuConfig}
            onButtonClick={(id) => console.log(`id: ${id}는 향후 api 연결에 사용될 예정입니다.`)}
          />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

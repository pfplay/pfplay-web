import { Disclosure } from '@headlessui/react';
import type { Meta } from '@storybook/react';
import PlayListItem, { PlayListItemType } from '@/components/@shared/@atoms/PlayListItem';
import Tag from '@/components/@shared/@atoms/Tag';
import UserListItem, { UserListItemType } from '@/components/@shared/UserListItem';
import CollapseList from '@/components/CollapseList';
import { exampleMenuConfig } from '@/constants/stories/exampleMenuConfig';

const meta = {
  title: 'ui/CollapseList',
  tags: ['autodocs'],
  component: CollapseList,
  decorators: [
    (Story) => <div className='w-full h-72 flexRow justify-end bg-black'>{Story()}</div>,
  ],
} satisfies Meta<typeof CollapseList>;

export default meta;

const exampleConfig: {
  playListPanel: PlayListItemType[];
  userListPanel: UserListItemType[];
} = {
  playListPanel: [
    {
      id: 1,
      title:
        'BLACKPINK(블랙핑크) - Shut Down @인기가요sssss inkigayo 20220925 long long long long long long long longlong long long long text',
      src: 'https://source.unsplash.com/user/c_v_r',
      alt: 'menu1',
      duration: '00:00',
    },
    {
      id: 2,
      title: 'BLACKPINK(블랙핑크)checkehck ',
      src: 'https://source.unsplash.com/user/c_v_r',
      alt: 'menu2',
      duration: '04:20',
    },
  ],
  userListPanel: [
    {
      id: 1,
      username: 'nickname1111',
      src: 'https://source.unsplash.com/user/c_v_r',
    },
    {
      id: 2,
      username: 'nickname222',
      src: 'https://source.unsplash.com/user/c_v_r',
    },
  ],
};

export const CollapseListDefault = () => {
  return (
    <CollapseList title={'Do you offer technical support?'}>
      {exampleConfig.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlayListItem playListItemConfig={config} menuItemList={exampleMenuConfig} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListAccent = () => {
  return (
    <CollapseList variant='accent' title={'Do you offer technical support?'}>
      {exampleConfig.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlayListItem playListItemConfig={config} menuItemList={exampleMenuConfig} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListOutlined = () => {
  return (
    <CollapseList variant='outlined' title={'Do you offer technical support?'}>
      {exampleConfig.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlayListItem playListItemConfig={config} menuItemList={exampleMenuConfig} />
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
      {exampleConfig.playListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <PlayListItem playListItemConfig={config} menuItemList={exampleMenuConfig} />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

export const CollapseListForUserlist = () => {
  return (
    <CollapseList title={'Do you offer technical support?'} infoText='24곡'>
      {exampleConfig.userListPanel.map((config) => (
        <Disclosure.Panel key={config.id} as='article' className=' text-gray-200'>
          <UserListItem
            suffixType='button'
            suffixValue='Click'
            userListItemConfig={config}
            menuItemList={exampleMenuConfig}
            onButtonClick={(id) => console.log(`id: ${id}는 향후 api 연결에 사용될 예정입니다.`)}
          />
        </Disclosure.Panel>
      ))}
    </CollapseList>
  );
};

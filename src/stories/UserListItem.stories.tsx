import type { Meta, StoryObj } from '@storybook/react';
import { MenuItem } from '@/components/@shared/Menu';
import UserListItem from '@/components/@shared/UserListItem';

const meta = {
  title: '@atoms/UserListItem',
  tags: ['autodocs'],
  component: UserListItem,
  decorators: [
    (Story) => (
      <div className='h-[240px] bg-gray-600'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserListItem>;

export default meta;

type Story = StoryObj<typeof UserListItem>;

const exampleMenuConfig: Array<MenuItem> = [
  { onClickItem: () => console.log('삭제 clicked'), label: '삭제' },
  { onClickItem: () => console.log('꿀 clicked'), label: '꿀' },
  { onClickItem: () => console.log('킥 clicked'), label: '킥' },
  { onClickItem: () => console.log('밴 clicked'), label: '밴' },
];

export const Preview: Story = {
  args: {
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    menuItemList: exampleMenuConfig,
  },
};

export const UserListItemWithTag: Story = {
  args: {
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    suffixType: 'tag',
    suffixValue: 'Tag',
    menuItemList: exampleMenuConfig,
  },
};

export const UserListItemWithButton: Story = {
  args: {
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    suffixType: 'button',
    suffixValue: 'Click',
    menuItemList: exampleMenuConfig,
    onButtonClick: () => console.log('button clicked'),
  },
};

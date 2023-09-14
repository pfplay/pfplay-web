import type { Meta, StoryObj } from '@storybook/react';
import UserListItem from '@/components/@shared/UserListItem';
import { exampleMenuConfig } from '@/constants/stories/exampleMenuConfig';

const meta = {
  title: 'ui/UserListItem',
  tags: ['autodocs'],
  component: UserListItem,
  args: {
    userListItemConfig: {
      id: 1,
      username: 'nickname',
      src: 'https://source.unsplash.com/user/c_v_r',
    },
    menuItemList: exampleMenuConfig,
  },
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

export const Preview: Story = {};

export const UserListItemWithTag: Story = {
  args: {
    suffixType: 'tag',
    suffixValue: 'Tag',
  },
};

export const UserListItemWithButton: Story = {
  args: {
    suffixType: 'button',
    suffixValue: 'Click',
    onButtonClick: (id?: number) => console.log(`id: ${id} clicked`),
  },
};

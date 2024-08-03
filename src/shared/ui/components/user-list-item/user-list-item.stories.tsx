import type { Meta, StoryObj } from '@storybook/react';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { UserListItem, UserListItemSuffix } from '@/shared/ui/components/user-list-item';

const meta = {
  title: 'features/UserListItem',
  tags: ['autodocs'],
  component: UserListItem,
  args: {
    userListItemConfig: {
      memberId: 1,
      nickname: 'nickname',
      avatarIconUri: '/images/Temp/nft.png',
    },
    menuItemList: fixtureMenuItems,
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
    suffix: {
      type: 'tag',
      Component: <UserListItemSuffix type='tag' value='Tag' />,
    },
  },
};

export const UserListItemWithButton: Story = {
  args: {
    suffix: {
      type: 'button',
      Component: (
        <UserListItemSuffix
          type='button'
          value='Click'
          onButtonClick={(id?: number) => console.log(`id: ${id} clicked`)}
        />
      ),
    },
  },
};

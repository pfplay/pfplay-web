import type { Meta, StoryObj } from '@storybook/react';
import PlaylistItem from '@/components/features/playlist/playlist-item.component';
import { fixtureMenuItems } from '@/shared/api/__fixture__/menu-items.fixture';

const meta = {
  title: 'features/PlaylistItem',
  component: PlaylistItem,
  tags: ['autodocs'],
  args: {
    playListItemConfig: {
      id: 1,
      title: 'BLACKPINK(블랙핑크) - Shut Down @인기가요 inkigayo 20220925',
      duration: '00:00',
      src: 'https://source.unsplash.com/user/c_v_r',
      alt: 'PlaylistItem',
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
} satisfies Meta<typeof PlaylistItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};

export const Ellipsis: Story = {
  name: 'Ellipsis (Adjust by Parent width)',
  decorators: [
    (Story) => {
      return <div className='max-w-[332px]'>{Story()}</div>;
    },
  ],
};

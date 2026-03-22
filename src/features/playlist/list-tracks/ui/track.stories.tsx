import type { Meta, StoryObj } from '@storybook/react';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { fixturePlaylistTracks } from '@/shared/api/http/__fixture__/playlist-tracks.fixture';
import Track from './track.component';

const meta = {
  title: 'features/track',
  component: Track,
  tags: ['autodocs'],
  args: {
    track: fixturePlaylistTracks[0],
    menuItems: fixtureMenuItems,
  },
  decorators: [
    (Story) => (
      <div className='h-[240px] bg-gray-600'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Track>;

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

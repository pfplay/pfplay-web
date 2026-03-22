import type { Meta, StoryObj } from '@storybook/react';
import { fixturePlaylists } from '@/shared/api/http/__fixture__/playlists.fixture';
import SelectPlaylist from './select-playlist.component';

const meta = {
  title: 'features/SelectPlaylistForDjing',
  component: SelectPlaylist,
  tags: ['autodocs'],
  args: {
    playlists: fixturePlaylists,
    onSelect: (selected) => console.log('Selected:', selected),
  },
  decorators: [
    (Story) => (
      <div className='bg-partyRoom flex justify-center'>
        <div className='w-[300px]'>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SelectPlaylist>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};

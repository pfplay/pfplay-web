import type { Meta, StoryObj } from '@storybook/react';
import { fixturePlaybackHistory } from '@/shared/api/http/__fixture__/playback-history.fixture';
import ListItem from './list-item.component';

const meta = {
  title: 'features/PlaybackHistoryItem',
  component: ListItem,
  tags: ['autodocs'],
  args: {
    item: fixturePlaybackHistory[0],
  },
  decorators: [
    (Story) => (
      <div className='p-3 bg-black'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};

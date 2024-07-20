import type { Meta, StoryObj } from '@storybook/react';
import DisplayBoard from './display-board.component';

const meta = {
  title: 'features/PartyroomDisplayBoard',
  component: DisplayBoard,
  tags: ['autodocs'],
  args: {
    width: 512,
  },
  decorators: [
    (Story) => (
      <div className='bg-partyRoom flex justify-center'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DisplayBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};

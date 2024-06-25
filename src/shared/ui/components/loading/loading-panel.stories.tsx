import type { Meta, StoryObj } from '@storybook/react';
import LoadingPaenl from './loading-panel.component';

const meta = {
  title: 'base/LoadingPanel',
  component: LoadingPaenl,
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingPaenl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    color: '#fff',
  },
};

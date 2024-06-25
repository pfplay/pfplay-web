import type { Meta, StoryObj } from '@storybook/react';
import LoadingPanel from './loading-panel.component';

const meta = {
  title: 'base/LoadingPanel',
  component: LoadingPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    color: '#fff',
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import Loading from './loading.component';

const meta = {
  title: 'base/Loading',
  component: Loading,
  tags: ['autodocs'],
} satisfies Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    color: '#fff',
  },
};

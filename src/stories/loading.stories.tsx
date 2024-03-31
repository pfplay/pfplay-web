import type { Meta, StoryObj } from '@storybook/react';
import Loading from '@/components/shared/atoms/loading.component';

const meta = {
  title: 'atoms/Loading',
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

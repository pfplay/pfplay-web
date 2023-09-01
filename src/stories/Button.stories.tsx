import type { Meta, StoryObj } from '@storybook/react';
import Icons from '@/components/Icons';
import Button from '@/components/ui/Button';

const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    children: 'Button',
  },
};

export const Icon: Story = {
  args: {
    children: 'Button',
    Icon: <Icons.wordglobe />,
  },
};

export const Loading: Story = {
  args: {
    children: 'Button',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Button',
    disabled: true,
  },
};

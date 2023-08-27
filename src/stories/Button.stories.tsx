import type { Meta, StoryObj } from '@storybook/react';
import Button from '@/components/ui/Button';

const meta: Meta<typeof Button> = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Preview: Story = {
  args: {
    children: 'Button',
  },
};

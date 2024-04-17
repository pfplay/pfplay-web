import type { Meta, StoryObj } from '@storybook/react';
import Button from '@/shared/ui/components/button/button.component';
import { PFLanguage } from '@/shared/ui/icons';

const meta = {
  title: 'base/Button',
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
    Icon: <PFLanguage />,
  },
};

export const IconOnly: Story = {
  args: {
    Icon: <PFLanguage />,
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

import type { Meta, StoryObj } from '@storybook/react';
import TextButton from '@/components/@shared/@atoms/TextButton';
import Icons from '@/components/__legacy__/Icons';

const meta = {
  title: 'ui/TextButton',
  component: TextButton,
  tags: ['autodocs'],
} satisfies Meta<typeof TextButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    children: 'Text btn',
  },
};

export const Icon: Story = {
  args: {
    children: 'Text btn',
    Icon: <Icons.wordglobe />,
  },
};

export const Underline: Story = {
  args: {
    children: 'Text btn',
    underline: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Text btn',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Text btn',
    disabled: true,
  },
};

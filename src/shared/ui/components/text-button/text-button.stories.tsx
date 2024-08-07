import Link from 'next/link';
import type { Meta, StoryObj } from '@storybook/react';
import { PFLanguage } from '@/shared/ui/icons';
import TextButton from './text-button.component';

const meta = {
  title: 'base/TextButton',
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
    Icon: <PFLanguage width={16} height={16} />,
  },
};

export const Underline: Story = {
  name: 'Underline (Will be wrapped in <Link>...</Link>.)',
  args: {
    children: 'Text btn',
    underline: true,
  },
  decorators: [(Story) => <Link href='#'>{Story()}</Link>],
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

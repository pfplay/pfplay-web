import type { Meta, StoryObj } from '@storybook/react';
import ButtonLink from '@/components/shared/button-link.component';

const meta = {
  title: 'atoms/ButtonLink',
  component: ButtonLink,
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    linkTitle: 'ButtonLink',
    href: 'https://www.naver.com' as any,
    path: undefined,
    classNames: { button: 'px-[90px]' },
  },
};

export const Disabled: Story = {
  args: {
    linkTitle: 'ButtonLink disabled',
    href: 'https://www.naver.com' as any,
    path: undefined,
    disabled: true,
    classNames: { button: 'px-[40px]' },
  },
};

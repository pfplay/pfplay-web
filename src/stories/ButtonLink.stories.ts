import type { Meta, StoryObj } from '@storybook/react';
import ButtonLink from '@/components/shared/ButtonLink';

const meta = {
  title: 'atoms/CustomLink',
  component: ButtonLink,
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    linkTitle: 'CustomLink',
    href: 'https://www.naver.com',
    classNames: { button: 'px-[90px]' },
  },
};

export const Disabled: Story = {
  args: {
    linkTitle: 'CustomLink disabled',
    href: 'https://www.naver.com',
    disabled: true,
    classNames: { button: 'px-[40px]' },
  },
};

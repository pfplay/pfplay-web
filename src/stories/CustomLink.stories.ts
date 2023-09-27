import type { Meta, StoryObj } from '@storybook/react';
import CustomLink from '@/components/@shared/CustomLink';

const meta = {
  title: '@atoms/CustomLink',
  component: CustomLink,
  tags: ['autodocs'],
} satisfies Meta<typeof CustomLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    linkTitle: 'CustomLink',
    href: 'https://www.naver.com',
    className: 'px-[90px]',
  },
};

export const Disabled: Story = {
  args: {
    linkTitle: 'CustomLink disabled',
    href: 'https://www.naver.com',
    disabled: true,
    className: 'px-[40px]',
  },
};

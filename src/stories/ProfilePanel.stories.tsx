import type { Meta, StoryObj } from '@storybook/react';
import ProfilePanel from '@/components/@shared/ProfilePanel';

const meta = {
  title: '@atoms/ProfilePanel',
  tags: ['autodocs'],
  component: ProfilePanel,
} satisfies Meta<typeof ProfilePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
  },
};

export const ProfilePanelAccentOutline: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    variant: 'outlineAccent',
  },
};

export const ProfilePanelWithTag: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    suffixType: 'tag',
    variant: 'outlineAccent',
  },
};

export const ProfilePanelWithButton: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    suffixType: 'button',
    suffixValue: 'Button',
    variant: 'outlineAccent',
  },
};

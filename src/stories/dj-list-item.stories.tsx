import type { Meta, StoryObj } from '@storybook/react';
import DjListItem from '@/components/shared/dj-list-item.component';

const meta = {
  title: 'ui/DjListItem',
  tags: ['autodocs'],
  component: DjListItem,
} satisfies Meta<typeof DjListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
  },
};

export const DjListItemWithOrder: Story = {
  args: {
    order: '1',
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
  },
};

export const DjListItemAccentOutline: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    variant: 'outlineAccent',
  },
};

export const DjListItemWithBackground: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    variant: 'filled',
  },
};

export const DjListItemWithTag: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: 'https://source.unsplash.com/user/c_v_r' },
    variant: 'outlineAccent',
    suffixTagValue: 'Tag',
  },
};

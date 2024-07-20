import type { Meta, StoryObj } from '@storybook/react';
import DjListItem from './dj-list-item.component';

const meta = {
  title: 'features/DjListItem',
  tags: ['autodocs'],
  component: DjListItem,
} satisfies Meta<typeof DjListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    userConfig: { username: 'nickname', src: '/images/Temp/nft.png' },
  },
};

export const DjListItemWithOrder: Story = {
  args: {
    order: '1',
    userConfig: { username: 'nickname', src: '/images/Temp/nft.png' },
  },
};

export const DjListItemAccentOutline: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: '/images/Temp/nft.png' },
    variant: 'outlineAccent',
  },
};

export const DjListItemWithBackground: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: '/images/Temp/nft.png' },
    variant: 'filled',
  },
};

export const DjListItemWithTag: Story = {
  args: {
    order: '0',
    userConfig: { username: 'nickname', src: '/images/Temp/nft.png' },
    variant: 'outlineAccent',
    suffixTagValue: 'Tag',
  },
};

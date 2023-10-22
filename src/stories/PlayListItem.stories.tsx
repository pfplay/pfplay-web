import type { Meta, StoryObj } from '@storybook/react';
import PlayListItem from '@/components/shared/atoms/PlayListItem';
import { mockMenuConfig } from '@/constants/__mock__/mockMenuConfig';

const meta = {
  title: 'ui/PlayListItem',
  component: PlayListItem,
  tags: ['autodocs'],
  args: {
    playListItemConfig: {
      id: 1,
      title: 'BLACKPINK(블랙핑크) - Shut Down @인기가요 inkigayo 20220925',
      duration: '00:00',
      src: 'https://source.unsplash.com/user/c_v_r',
      alt: 'PlayListItem',
    },
    menuItemList: mockMenuConfig,
  },
  decorators: [
    (Story) => (
      <div className='h-[240px] bg-gray-600'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};

export const Ellipsis: Story = {
  name: 'Ellipsis (Adjust by Parent width)',
  decorators: [
    (Story) => {
      return <div className='max-w-[332px]'>{Story()}</div>;
    },
  ],
};

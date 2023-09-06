import type { Meta, StoryObj } from '@storybook/react';
import PlayListItem from '@/components/@shared/PlaylistItem';

const meta = {
  title: '@atoms/PlayListItem',
  component: PlayListItem,
  tags: ['autodocs'],
} satisfies Meta<typeof PlayListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    id: 1,
    title: 'BLACKPINK(블랙핑크) - Shut Down @인기가요 inkigayo 20220925',
    duration: '00:00',
    src: 'https://source.unsplash.com/user/c_v_r',
    alt: 'PlayListItem',
  },
};

export const Ellipsis: Story = {
  name: 'Ellipsis (Adjust by Parent width)',
  args: {
    id: 1,
    title: 'BLACKPINK(블랙핑크) - Shut Down @인기가요 inkigayo 20220925',
    duration: '00:00',
    src: 'https://source.unsplash.com/user/c_v_r',
    alt: 'PlayListItem',
  },
  decorators: [
    (Story) => {
      return <div className='max-w-[332px]'>{Story()}</div>;
    },
  ],
};

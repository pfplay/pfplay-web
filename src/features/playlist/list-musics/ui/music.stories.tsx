import type { Meta, StoryObj } from '@storybook/react';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import Music from './music.component';

const meta = {
  title: 'features/music',
  component: Music,
  tags: ['autodocs'],
  args: {
    music: {
      musicId: 1,
      orderNumber: 1,
      name: 'BLACKPINK(블랙핑크) - Shut Down @인기가요 inkigayo 20220925',
      duration: '00:00',
      thumbnailImage: '/images/Background/Profile.png',
    },
    menuItems: fixtureMenuItems,
  },
  decorators: [
    (Story) => (
      <div className='h-[240px] bg-gray-600'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Music>;

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

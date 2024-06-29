import type { Meta, StoryObj } from '@storybook/react';
import Profile from './profile.component';

const meta = {
  title: 'base/Profile',
  component: Profile,
  tags: ['autodocs'],
  args: {
    size: 32,
  },
} satisfies Meta<typeof Profile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    src: '/images/Temp/nft.png',
  },
};

export const Empty: Story = {
  args: {},
};

export const Sizes: Story = {
  render: (args) => (
    <>
      <Profile {...args} size={32} />
      <Profile {...args} size={64} />
      <Profile {...args} size={128} />
    </>
  ),
  decorators: [
    (Story) => (
      <div className='flex items-end gap-4'>
        <Story />
      </div>
    ),
  ],
};

import type { Meta, StoryObj } from '@storybook/react';
import { cn } from '@/shared/lib/functions/cn';
import Tooltip from './tooltip.component';

const meta = {
  title: 'base/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return <div className={cn('h-[120px] flex justify-center items-start')}>{Story()}</div>;
    },
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    children: <p className='text-gray-50'>컨텐츠</p>,
    title: '툴팁 내용',
    visible: true,
  },
};

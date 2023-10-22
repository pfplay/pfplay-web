import { Meta, StoryObj } from '@storybook/react';
import TextArea from '@/components/shared/atoms/TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'atoms/TextArea',
  component: TextArea,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {},
};

export const FixedWidth: Story = {
  args: {
    classNames: {
      container: 'w-[400px]',
    },
  },
};

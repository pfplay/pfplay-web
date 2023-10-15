import { Meta, StoryObj } from '@storybook/react';
import InputNumber from '@/components/@shared/@atoms/InputNumber';

const meta: Meta<typeof InputNumber> = {
  title: '@atoms/InputNumber',
  component: InputNumber,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {},
};

export const NotLocale: Story = {
  args: {
    locale: false,
  },
};

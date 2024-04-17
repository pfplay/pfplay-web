import { Meta, StoryObj } from '@storybook/react';
import InputNumber from '@/shared/ui/components/input-number/input-number.component';

const meta: Meta<typeof InputNumber> = {
  title: 'base/InputNumber',
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

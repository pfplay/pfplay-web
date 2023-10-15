import { Meta, StoryObj } from '@storybook/react';
import Button from '@/components/@shared/@atoms/Button';
import Input from '@/components/@shared/@atoms/Input';
import { PFHeadset } from '@/components/@shared/@icons';

const meta: Meta<typeof Input> = {
  title: '@atoms/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    maxLength: 10,
  },
};

export const FixedWidth: Story = {
  args: {
    classNames: {
      container: 'w-[300px]',
    },
  },
};

export const PrefixAndSuffix: Story = {
  args: {
    maxLength: 10,
    Prefix: <PFHeadset />,
    Suffix: (
      <Button color={'secondary'} variant={'outline'}>
        Button
      </Button>
    ),
  },
};

export const LargeAndOutlined: Story = {
  args: {
    variant: 'outlined',
    size: 'lg',
  },
};

import { Meta, StoryObj } from '@storybook/react';
import Button from '@/components/@shared/@atoms/Button';
import Input from '@/components/@shared/@atoms/Input';
import Icons from '@/components/__legacy__/Icons';

const meta: Meta<typeof Input> = {
  title: '@atoms/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Preview: Story = {
  args: {
    value: '',
    placeholder: 'Placeholder',
    maxLen: 10,
  },
};

export const Error: Story = {
  args: {
    value: 'error',
    placeholder: 'Placeholder',
    maxLen: 10,
    error: true,
  },
};

export const Icon: Story = {
  args: {
    value: '',
    placeholder: 'Placeholder',
    maxLen: 10,
    icon: <Icons.headset />,
  },
};

export const DisabledColoredButton: Story = {
  args: {
    value: '',
    placeholder: 'Placeholder',
    button: <Button Icon={<Icons.chat />} disabled={true} />,
  },
};

export const ColoredButton: Story = {
  args: {
    value: 'pfplay',
    placeholder: 'Placeholder',
    button: <Button Icon={<Icons.chat />} />,
  },
};

export const OutlinedButton: Story = {
  args: {
    value: 'pfplay',
    placeholder: 'Placeholder',
    button: (
      <Button color={'secondary'} variant={'outline'}>
        Button
      </Button>
    ),
  },
};

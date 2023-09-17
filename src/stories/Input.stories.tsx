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
    max: 10,
  },
};

export const Error: Story = {
  args: {
    value: 'error',
    placeholder: 'Placeholder',
    max: 10,
    error: true,
  },
};

export const Icon: Story = {
  args: {
    value: '',
    placeholder: 'Placeholder',
    max: 10,
    Icon: <Icons.headset color='white' fillOpacity={0.5} />,
  },
};

export const DisabledColoredButton: Story = {
  args: {
    value: '',
    placeholder: 'Placeholder',
    Button: <Button Icon={<Icons.chat />} disabled={true} />,
  },
};

export const ColoredButton: Story = {
  args: {
    value: 'pfplay',
    placeholder: 'Placeholder',
    Button: <Button Icon={<Icons.chat color={'white'} fillOpacity={0.5} />} />,
  },
};

export const OutlinedButton: Story = {
  args: {
    value: 'pfplay',
    placeholder: 'Placeholder',
    Button: (
      <Button color={'secondary'} variant={'outline'}>
        Button
      </Button>
    ),
  },
};

import { Button, ButtonProps } from '@/components/ui/Button';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    intent: 'primary',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    intent: 'secondary',
    children: 'Secondary',
  },
};

export const FullWidth: Story = {
  args: {
    intent: 'primary',
    fullWidth: true,
    children: 'Full width button',
  },
};

export const Text = (args: ButtonProps) => (
  <div className='flexRowCenter p-20 bg-black'>
    <div>
      <Button intent='text' {...args}>
        Text Button
      </Button>
    </div>
  </div>
);

export const Outlined = (args: ButtonProps) => (
  <div className='flexRowCenter p-20 bg-black'>
    <div>
      <Button intent='outlined' {...args}>
        Outlined Button
      </Button>
    </div>
  </div>
);


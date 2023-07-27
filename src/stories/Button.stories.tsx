import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonProps } from '@/components/ui/Button';

const meta: Meta<typeof Button> = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Preview: Story = {
  args: {
    intent: 'primary',
    size: 'xLarge',
    children: 'button',
  },
};

export const Primary = (args: ButtonProps) => (
  <div className='flex justify-between items-end p-5 bg-black'>
    <Button intent='primary' size={'xLarge'} {...args}>
      xLarge
    </Button>
    <Button intent='primary' size={'large'} {...args}>
      large
    </Button>
    <Button intent='primary' size={'medium'} {...args}>
      medium
    </Button>
    <Button intent='primary' size={'small'} {...args}>
      small
    </Button>
    <Button intent='primary' size={'xSmall'} {...args}>
      xSmall
    </Button>
  </div>
);

export const PrimaryDisabled = (args: ButtonProps) => (
  <div className='flex justify-between items-end p-5 bg-black'>
    <Button intent='primary-disabled' size={'xLarge'} disabled {...args}>
      xLarge
    </Button>
    <Button intent='primary-disabled' size={'large'} disabled {...args}>
      large
    </Button>
    <Button intent='primary-disabled' size={'medium'} disabled {...args}>
      medium
    </Button>
    <Button intent='primary-disabled' size={'small'} disabled {...args}>
      small
    </Button>
    <Button intent='primary-disabled' size={'xSmall'} disabled {...args}>
      xSmall
    </Button>
  </div>
);

export const PrimaryOutline = (args: ButtonProps) => (
  <div className='flex justify-between items-end p-5 bg-black'>
    <Button intent='primary-outline' size={'xLarge'} {...args}>
      xLarge
    </Button>
    <Button intent='primary-outline' size={'large'} {...args}>
      large
    </Button>
    <Button intent='primary-outline' size={'medium'} {...args}>
      medium
    </Button>
    <Button intent='primary-outline' size={'small'} {...args}>
      small
    </Button>
    <Button intent='primary-outline' size={'xSmall'} {...args}>
      xSmall
    </Button>
  </div>
);

export const PrimaryOutlineDisabled = (args: ButtonProps) => (
  <div className='flex justify-between items-end p-5 bg-black'>
    <Button intent='primary-outline-disabled' size={'xLarge'} disabled {...args}>
      xLarge
    </Button>
    <Button intent='primary-outline-disabled' size={'large'} disabled {...args}>
      large
    </Button>
    <Button intent='primary-outline-disabled' size={'medium'} disabled {...args}>
      medium
    </Button>
    <Button intent='primary-outline-disabled' size={'small'} disabled {...args}>
      small
    </Button>
    <Button intent='primary-outline-disabled' size={'xSmall'} disabled {...args}>
      xSmall
    </Button>
  </div>
);

export const Secondary = (args: ButtonProps) => (
  <div className='flex justify-between items-end p-5 bg-black'>
    <Button intent='secondary' size={'xLarge'} {...args}>
      xLarge
    </Button>
    <Button intent='secondary' size={'large'} {...args}>
      large
    </Button>
    <Button intent='secondary' size={'medium'} {...args}>
      medium
    </Button>
    <Button intent='secondary' size={'small'} {...args}>
      small
    </Button>
    <Button intent='secondary' size={'xSmall'} {...args}>
      xSmall
    </Button>
  </div>
);

export const SecondaryDisabled = (args: ButtonProps) => (
  <div className='flex justify-between items-end p-5 bg-black'>
    <Button intent='secondary-disabled' size={'xLarge'} disabled {...args}>
      xLarge
    </Button>
    <Button intent='secondary-disabled' size={'large'} disabled {...args}>
      large
    </Button>
    <Button intent='secondary-disabled' size={'medium'} disabled {...args}>
      medium
    </Button>
    <Button intent='secondary-disabled' size={'small'} disabled {...args}>
      small
    </Button>
    <Button intent='secondary-disabled' size={'xSmall'} disabled {...args}>
      xSmall
    </Button>
  </div>
);

export const SecondaryOutline = (args: ButtonProps) => (
  <div className='flex justify-between items-end p-5 bg-black'>
    <Button intent='secondary-outline' size={'xLarge'} {...args}>
      xLarge
    </Button>
    <Button intent='secondary-outline' size={'large'} {...args}>
      large
    </Button>
    <Button intent='secondary-outline' size={'medium'} {...args}>
      medium
    </Button>
    <Button intent='secondary-outline' size={'small'} {...args}>
      small
    </Button>
    <Button intent='secondary-outline' size={'xSmall'} {...args}>
      xSmall
    </Button>
  </div>
);

export const SecondaryOutlineDisabled = (args: ButtonProps) => (
  <div className='flex justify-between items-end p-5 bg-black'>
    <Button intent='secondary-outline-disabled' size={'xLarge'} disabled {...args}>
      xLarge
    </Button>
    <Button intent='secondary-outline-disabled' size={'large'} disabled {...args}>
      large
    </Button>
    <Button intent='secondary-outline-disabled' size={'medium'} disabled {...args}>
      medium
    </Button>
    <Button intent='secondary-outline-disabled' size={'small'} disabled {...args}>
      small
    </Button>
    <Button intent='secondary-outline-disabled' size={'xSmall'} disabled {...args}>
      xSmall
    </Button>
  </div>
);

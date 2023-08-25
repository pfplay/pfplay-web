import type { Meta } from '@storybook/react';
import Chip from '@/components/ui/Chip';

const meta = {
  title: 'ui/Chip',
  tags: ['autodocs'],
  component: Chip,
} satisfies Meta<typeof Chip>;

export default meta;

export const ChipFilled = () => {
  return <Chip value='filled' />;
};

export const ChipOutlined = () => {
  return <Chip value='outlined' variant='outlined' />;
};

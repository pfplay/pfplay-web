import type { Meta } from '@storybook/react';
import ProfileMenu from '@/components/@features/Home/ProfileMenu';

const meta = {
  title: 'ui/ProfileMenu',
  tags: ['autodocs'],
  component: ProfileMenu,
} satisfies Meta<typeof ProfileMenu>;

export default meta;

export const ProfleMenu = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <ProfileMenu email='pfplay@pfplay.com' />
    </div>
  );
};

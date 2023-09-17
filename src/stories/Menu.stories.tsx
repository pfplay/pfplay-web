import type { Meta } from '@storybook/react';
import Menu from '@/components/@shared/Menu';
import Icons from '@/components/__legacy__/Icons';
import { mockMenuConfig } from '@/constants/__mock__/mockMenuConfig';

const meta = {
  title: 'ui/Menu',
  tags: ['autodocs'],
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;

export const MenuLarge = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <Menu optionMenuConfig={mockMenuConfig} size='lg' />
    </div>
  );
};

export const MenuMedium = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <Menu optionMenuConfig={mockMenuConfig} size='md' />
    </div>
  );
};

export const MenuSmall = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <Menu optionMenuConfig={mockMenuConfig} size='sm' />
    </div>
  );
};

export const MenuWithHeaderIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <Menu
        optionMenuConfig={mockMenuConfig}
        HeaderIcon={<Icons.arrowLeft width={24} height={24} stroke='#fff' />}
        size='sm'
      />
    </div>
  );
};

export const OptionMenuItemWithPrefixIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <Menu
        optionMenuConfig={mockMenuConfig}
        MenuItemPrefixIcon={<Icons.arrowDown stroke='#fff' />}
      />
    </div>
  );
};

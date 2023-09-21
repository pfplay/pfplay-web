import React from 'react';
import type { Meta } from '@storybook/react';
import IconMenu from '@/components/@shared/IconMenu';
import Icons from '@/components/__legacy__/Icons';
import { mockMenuConfig } from '@/constants/__mock__/mockMenuConfig';

const meta = {
  title: 'ui/IconMenu',
  tags: ['autodocs'],
  component: IconMenu,
} satisfies Meta<typeof IconMenu>;

export default meta;

export const IconMenuLarge = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu MenuButtonIcon={<Icons.option />} menuItemConfig={mockMenuConfig} size='lg' />
    </div>
  );
};

export const IconMenuMedium = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu MenuButtonIcon={<Icons.option />} menuItemConfig={mockMenuConfig} size='md' />
    </div>
  );
};

export const IconMenuSmall = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu MenuButtonIcon={<Icons.option />} menuItemConfig={mockMenuConfig} size='sm' />
    </div>
  );
};

export const MenuWithHeaderIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu
        MenuButtonIcon={<Icons.option />}
        menuItemConfig={mockMenuConfig}
        menuItemPanel={{
          HeaderIcon: <Icons.arrowLeft width={24} height={24} stroke='#fff' />,
        }}
        size='sm'
      />
    </div>
  );
};

export const IconMenuItemWithPrefixIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu
        MenuButtonIcon={<Icons.option />}
        menuItemConfig={mockMenuConfig}
        menuItemPanel={{ PrefixIcon: <Icons.arrowDown stroke='#fff' /> }}
      />
    </div>
  );
};

import React from 'react';
import type { Meta } from '@storybook/react';
import OptionMenu from '@/components/@shared/Menu/Menu';
import Icons from '@/components/__legacy__/Icons';
import { mockMenuConfig } from '@/constants/__mock__/mockMenuConfig';

const meta = {
  title: 'ui/OptionMenu',
  tags: ['autodocs'],
  component: OptionMenu,
} satisfies Meta<typeof OptionMenu>;

export default meta;

export const OptionMenuLarge = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <OptionMenu optionMenuConfig={mockMenuConfig} size='lg' />
    </div>
  );
};

export const OptionMenuMedium = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <OptionMenu optionMenuConfig={mockMenuConfig} size='md' />
    </div>
  );
};

export const OptionMenuSmall = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <OptionMenu optionMenuConfig={mockMenuConfig} size='sm' />
    </div>
  );
};

export const MenuWithHeaderIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <OptionMenu
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
      <OptionMenu
        optionMenuConfig={mockMenuConfig}
        MenuItemPrefixIcon={<Icons.arrowDown stroke='#fff' />}
      />
    </div>
  );
};

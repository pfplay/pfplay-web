import type { Meta } from '@storybook/react';
import IconMenu from '@/components/shared/IconMenu';
import { PFMoreVert, PFArrowLeft, PFChevronDown } from '@/components/shared/icons';

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
      <IconMenu
        MenuButtonIcon={<PFMoreVert />}
        menuItemConfig={mockMenuConfig}
        menuItemPanel={{
          size: 'lg',
        }}
      />
    </div>
  );
};

export const IconMenuMedium = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu
        MenuButtonIcon={<PFMoreVert />}
        menuItemConfig={mockMenuConfig}
        menuItemPanel={{
          size: 'md',
        }}
      />
    </div>
  );
};

export const IconMenuSmall = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu
        MenuButtonIcon={<PFMoreVert />}
        menuItemConfig={mockMenuConfig}
        menuItemPanel={{
          size: 'sm',
        }}
      />
    </div>
  );
};

export const MenuWithHeaderIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu
        MenuButtonIcon={<PFMoreVert />}
        menuItemConfig={mockMenuConfig}
        menuItemPanel={{
          HeaderIcon: <PFArrowLeft width={24} height={24} stroke='#fff' />,
          size: 'sm',
        }}
      />
    </div>
  );
};

export const IconMenuItemWithPrefixIcon = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu
        MenuButtonIcon={<PFMoreVert />}
        menuItemConfig={mockMenuConfig}
        menuItemPanel={{ PrefixIcon: <PFChevronDown stroke='#fff' /> }}
      />
    </div>
  );
};

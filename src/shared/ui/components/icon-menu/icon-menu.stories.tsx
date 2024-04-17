import type { Meta } from '@storybook/react';
import { fixtureMenuItems } from '@/constants/__fixture__/menu-items.fixture';
import { PFMoreVert, PFArrowLeft, PFChevronDown } from '@/shared/ui/icons';
import IconMenu from './icon-menu.component';

const meta = {
  title: 'base/IconMenu',
  tags: ['autodocs'],
  component: IconMenu,
} satisfies Meta<typeof IconMenu>;

export default meta;

export const IconMenuLarge = () => {
  return (
    <div className='w-2/3 h-72 flexRow justify-end'>
      <IconMenu
        MenuButtonIcon={<PFMoreVert />}
        menuItemConfig={fixtureMenuItems}
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
        menuItemConfig={fixtureMenuItems}
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
        menuItemConfig={fixtureMenuItems}
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
        menuItemConfig={fixtureMenuItems}
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
        menuItemConfig={fixtureMenuItems}
        menuItemPanel={{ PrefixIcon: <PFChevronDown stroke='#fff' /> }}
      />
    </div>
  );
};

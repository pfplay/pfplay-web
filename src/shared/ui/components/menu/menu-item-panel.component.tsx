import { Fragment, ReactNode } from 'react';
import { Transition, MenuItems, MenuItem } from '@headlessui/react';
import { cn } from '@/shared/lib/functions/cn';

// TODO: MenuConfig 정해지면 type 재정의하기
export type MenuItem = {
  onClickItem: () => void;
  label: string;
  Icon?: ReactNode;
  visible?: boolean;
};
export type MenuItemPanelSize = 'lg' | 'md' | 'sm';
const MenuItemBoxSize: Record<MenuItemPanelSize, string> = {
  lg: 'min-w-[330px] w-max',
  md: 'min-w-[220px] w-max',
  sm: 'min-w-[90px] w-max',
};

interface MenuItemPanelProps {
  menuItemConfig: Array<MenuItem>;
  HeaderIcon?: ReactNode;
  MenuItemPrefixIcon?: ReactNode;
  menuItemPanelStyle?: string;
  size?: MenuItemPanelSize;
  onMenuClose: () => void;
}

const MenuItemPanel = ({
  menuItemConfig,
  HeaderIcon,
  MenuItemPrefixIcon,
  menuItemPanelStyle,
  size = 'lg',
  onMenuClose,
}: MenuItemPanelProps) => {
  const handleMenuItemClick = (config: MenuItem) => {
    config.onClickItem();
    onMenuClose();
  };

  return (
    <Transition
      as={Fragment}
      enter='transition ease-out duration-100'
      enterFrom='transform opacity-0 scale-95'
      enterTo='transform opacity-100 scale-100'
      leave='transition ease-in duration-75'
      leaveFrom='transform opacity-100 scale-100'
      leaveTo='transform opacity-0 scale-95'
    >
      <MenuItems
        as='ul'
        anchor='bottom end'
        className={cn(
          'absolute right-0 mt-2 py-2 origin-top-right rounded-[4px] bg-gray-800 shadow-lg z-50',
          menuItemPanelStyle,
          MenuItemBoxSize[size]
        )}
      >
        {HeaderIcon && (
          <div className='px-3 py-[6px]' onClick={() => onMenuClose()}>
            {HeaderIcon}
          </div>
        )}
        {menuItemConfig.map((config) => {
          if (config.visible === false) return null;

          return (
            <MenuItem as={Fragment} key={config.label}>
              {({ focus }) => (
                <li
                  onClick={() => handleMenuItemClick(config)}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-sm px-4 py-3 cursor-pointer text-gray-50',
                    focus && 'bg-gray-700',
                    size === 'sm' && `text-sm`
                  )}
                >
                  {MenuItemPrefixIcon && size !== 'sm' && MenuItemPrefixIcon}

                  <span className='flex items-center gap-2'>
                    {config.Icon}
                    {config.label}
                  </span>
                </li>
              )}
            </MenuItem>
          );
        })}
      </MenuItems>
    </Transition>
  );
};

export default MenuItemPanel;

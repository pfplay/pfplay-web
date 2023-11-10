import { Fragment } from 'react';
import { Transition, Menu } from '@headlessui/react';
import { cn } from '@/utils/cn';

// TODO: MenuConfig 정해지면 type 재정의하기
export type MenuItem = { onClickItem: () => void; label: string };
export type MenuItemPanelSize = 'lg' | 'md' | 'sm';
const MenuItemBoxSize: Record<MenuItemPanelSize, string> = {
  lg: 'w-[330px]',
  md: 'w-[220px]',
  sm: 'w-[90px]',
};

interface MenuItemPanelProps {
  menuItemConfig: Array<MenuItem>;
  HeaderIcon?: React.ReactNode;
  MenuItemPrefixIcon?: React.ReactNode;
  menuItemPanelStyle?: string;
  size?: MenuItemPanelSize;
  close: () => void;
  onMenuClose?: () => void;
}

const MenuItemPanel = ({
  menuItemConfig,
  HeaderIcon,
  MenuItemPrefixIcon,
  menuItemPanelStyle,
  size = 'lg',
  close,
  onMenuClose,
}: MenuItemPanelProps) => {
  const handleMenuItemClick = (config: MenuItem) => {
    config.onClickItem();
    onMenuClose && onMenuClose();
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
      <Menu.Items
        as='ul'
        className={cn(
          'absolute right-0 mt-2 py-2 origin-top-right rounded-[4px] bg-gray-800 shadow-lg z-50',
          menuItemPanelStyle,
          MenuItemBoxSize[size]
        )}
      >
        {HeaderIcon && (
          <div className='px-3 py-[6px]' onClick={() => close()}>
            {HeaderIcon}
          </div>
        )}
        {menuItemConfig.map((config) => (
          <Menu.Item as={Fragment} key={config.label}>
            {({ active }) => (
              <li
                onClick={() => handleMenuItemClick(config)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-sm px-4 py-3 cursor-pointer text-gray-50',
                  active && 'bg-gray-700',
                  size === 'sm' && `text-sm`
                )}
              >
                {MenuItemPrefixIcon && size !== 'sm' && MenuItemPrefixIcon}
                {config.label}
              </li>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Transition>
  );
};

export default MenuItemPanel;

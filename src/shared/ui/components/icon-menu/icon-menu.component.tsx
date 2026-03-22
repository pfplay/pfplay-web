'use client';
import { forwardRef, ReactNode } from 'react';
import { Menu } from '@headlessui/react';
import { MenuItem, MenuButton, MenuItemPanelSize, MenuItemPanel } from '../menu';

interface IconMenuProps {
  menuItemConfig: Array<MenuItem>;
  menuItemPanel?: {
    HeaderIcon?: ReactNode;
    PrefixIcon?: ReactNode;
    className?: string;
    size?: MenuItemPanelSize;
  };
  menuContainerClassName?: string;
  MenuButtonIcon: ReactNode;
  onMenuClose?: () => void;
  onMenuIconClick?: () => void;
}

const IconMenu = forwardRef<HTMLDivElement, IconMenuProps>(
  (
    {
      MenuButtonIcon,
      menuItemConfig,
      menuContainerClassName,
      onMenuClose,
      onMenuIconClick,
      menuItemPanel: { HeaderIcon, PrefixIcon, className, size = 'lg' } = {},
    },
    ref
  ) => {
    const handleMenuClose = (close: () => void) => {
      close();
      onMenuClose?.();
    };

    return (
      <div className={menuContainerClassName} ref={ref}>
        <Menu as='section' className={`relative w-fit`}>
          {({ close }) => (
            <>
              <MenuButton type='icon' onMenuIconClick={onMenuIconClick}>
                {MenuButtonIcon}
              </MenuButton>
              <MenuItemPanel
                menuItemConfig={menuItemConfig}
                HeaderIcon={HeaderIcon}
                MenuItemPrefixIcon={PrefixIcon}
                menuItemPanelStyle={className}
                size={size}
                onMenuClose={() => handleMenuClose(close)}
              />
            </>
          )}
        </Menu>
      </div>
    );
  }
);

export default IconMenu;

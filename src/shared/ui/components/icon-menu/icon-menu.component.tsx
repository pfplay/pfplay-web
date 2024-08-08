'use client';
import { forwardRef, ReactNode } from 'react';
import { Menu } from '@headlessui/react';
import { cn } from '@/shared/lib/functions/cn';
import { MenuItem, MenuButton, MenuItemPanelSize, MenuItemPanel } from '../menu';

interface IconMenuProps {
  menuItemConfig: Array<MenuItem>;
  menuItemPanel?: {
    HeaderIcon?: ReactNode;
    PrefixIcon?: ReactNode;
    className?: string;
    size?: MenuItemPanelSize;
  };
  menuContainerStyle?: string;
  MenuButtonIcon: ReactNode;
  onMenuClose?: () => void;
  onMenuIconClick?: () => void;
}

const IconMenu = forwardRef<HTMLDivElement, IconMenuProps>(
  (
    {
      MenuButtonIcon,
      menuItemConfig,
      menuContainerStyle,
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
      <div className={cn(menuContainerStyle)} ref={ref}>
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

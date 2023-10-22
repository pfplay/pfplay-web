'use client';
import React, { forwardRef } from 'react';
import { Menu } from '@headlessui/react';
import { cn } from '@/utils/cn';
import MenuButton from './atoms/Menu/MenuButton';
import MenuItemPanel, { MenuItem, MenuItemPanelSize } from './atoms/Menu/MenuItemPanel';

interface IconMenuProps {
  menuItemConfig: Array<MenuItem>;
  menuItemPanel?: {
    HeaderIcon?: React.ReactNode;
    PrefixIcon?: React.ReactNode;
    className?: string;
    size?: MenuItemPanelSize;
  };
  menuContainerStyle?: string;
  MenuButtonIcon: React.ReactNode;
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
                close={close}
                onMenuClose={onMenuClose}
              />
            </>
          )}
        </Menu>
      </div>
    );
  }
);

export default IconMenu;

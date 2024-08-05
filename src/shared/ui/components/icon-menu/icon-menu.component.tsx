'use client';
import { forwardRef, ReactNode, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMenuOpen = () => {
      setAnchorEl(buttonRef.current);
      onMenuIconClick && onMenuIconClick();
    };

    return (
      <div className={cn(menuContainerStyle)} ref={ref}>
        <Menu as='section' className={`relative w-fit`}>
          {({ open, close }) => (
            <>
              <MenuButton type='icon' onMenuIconClick={handleMenuOpen} ref={buttonRef}>
                {MenuButtonIcon}
              </MenuButton>
              {open &&
                createPortal(
                  <MenuItemPanel
                    menuItemConfig={menuItemConfig}
                    HeaderIcon={HeaderIcon}
                    MenuItemPrefixIcon={PrefixIcon}
                    menuItemPanelStyle={className}
                    size={size}
                    close={close}
                    onMenuClose={onMenuClose}
                    anchorEl={anchorEl}
                  />,
                  document.body
                )}
            </>
          )}
        </Menu>
      </div>
    );
  }
);

export default IconMenu;

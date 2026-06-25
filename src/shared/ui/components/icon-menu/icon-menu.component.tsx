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
  menuButtonTestId?: string;
  onMenuClose?: () => void;
  onMenuIconClick?: () => void;
  menuZIndex?: number;
}

const IconMenu = forwardRef<HTMLDivElement, IconMenuProps>(
  (
    {
      MenuButtonIcon,
      menuButtonTestId,
      menuItemConfig,
      menuContainerClassName,
      onMenuClose,
      onMenuIconClick,
      menuZIndex,
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
              <MenuButton
                type='icon'
                onMenuIconClick={onMenuIconClick}
                data-testid={menuButtonTestId}
              >
                {MenuButtonIcon}
              </MenuButton>
              <MenuItemPanel
                menuItemConfig={menuItemConfig}
                HeaderIcon={HeaderIcon}
                MenuItemPrefixIcon={PrefixIcon}
                menuItemPanelStyle={className}
                size={size}
                zIndex={menuZIndex}
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

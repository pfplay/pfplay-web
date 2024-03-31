'use client';
import { forwardRef, ReactNode } from 'react';
import { Menu } from '@headlessui/react';
import MenuButton from '@/components/shared/atoms/menu/menu-button.component';
import MenuItemPanel, {
  MenuItem,
  MenuItemPanelSize,
} from '@/components/shared/atoms/menu/menu-item-panel.component';
import { cn } from '@/utils/cn';

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

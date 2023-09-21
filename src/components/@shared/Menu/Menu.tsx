'use client';
import { forwardRef } from 'react';
import { Menu } from '@headlessui/react';
import Icons from '@/components/__legacy__/Icons';
import { cn } from '@/utils/cn';
import MenuButton from './MenuButton';
import MenuItemPanel, { MenuItem } from './MenuItemPanel';

export type MenuItemBoxSizeKey = 'lg' | 'md' | 'sm';

interface OptionMenuProps {
  // TODO:  optionMenuConfig 정해지면 type 재정의하기
  optionMenuConfig: Array<MenuItem>;
  HeaderIcon?: React.ReactNode;
  MenuItemPrefixIcon?: React.ReactNode;
  menuItemPanelStyle?: string;
  menuContainerStyle?: string;
  size?: MenuItemBoxSizeKey;
  onMenuClose?: () => void;
  onMenuIconClick?: () => void;
}

const OptionMenu = forwardRef<HTMLDivElement, OptionMenuProps>(
  (
    {
      optionMenuConfig,
      HeaderIcon,
      MenuItemPrefixIcon,
      menuItemPanelStyle,
      menuContainerStyle,
      onMenuClose,
      onMenuIconClick,
      size = 'lg',
    },
    ref
  ) => {
    return (
      <div className={cn(menuContainerStyle)} ref={ref}>
        <Menu as='section' className={`relative w-fit`}>
          {({ close }) => (
            <>
              <MenuButton type='icon' onMenuIconClick={onMenuIconClick}>
                <Icons.option />
              </MenuButton>
              <MenuItemPanel
                optionMenuConfig={optionMenuConfig}
                HeaderIcon={HeaderIcon}
                MenuItemPrefixIcon={MenuItemPrefixIcon}
                menuItemPanelStyle={menuItemPanelStyle}
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

export default OptionMenu;

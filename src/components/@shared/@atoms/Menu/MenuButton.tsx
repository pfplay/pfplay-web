import React, { PropsWithChildren } from 'react';
import { Menu } from '@headlessui/react';
import { cn } from '@/utils/cn';
import { sizeDict, colorsDict } from '../Button';

interface MenuButtonProps {
  type: 'icon' | 'button';
  onMenuIconClick?: () => void;
}
export const MenuButton = ({
  type = 'icon',
  children,
  onMenuIconClick,
}: PropsWithChildren<MenuButtonProps>) => {
  return (
    <Menu.Button
      onClick={() => {
        onMenuIconClick && onMenuIconClick();
      }}
      className={cn(
        'flex h-max items-center justify-center gap-[8px] rounded-[4px]',
        type === 'icon' && 'flex items-center gap-2 text-gray-50 p-2',
        type === 'button' &&
          `border border-solid px-[16px] h-[36px] ${sizeDict['md']} ${colorsDict['secondary']['outline'].default}`
      )}
    >
      {children}
    </Menu.Button>
  );
};

export default MenuButton;

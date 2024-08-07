import { PropsWithChildren } from 'react';
import { MenuButton as _MenuButton } from '@headlessui/react';
import { cn } from '@/shared/lib/functions/cn';
import { buttonColorsDict, buttonSizeDict } from '../button';

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
    <_MenuButton
      onClick={() => {
        onMenuIconClick && onMenuIconClick();
      }}
      className={cn(
        'flex h-max items-center justify-center gap-[8px] rounded-[4px]',
        type === 'icon' && 'flex items-center gap-2 text-gray-50 p-1',
        type === 'button' &&
          `border border-solid px-[16px] h-[36px] ${buttonSizeDict['md']} ${buttonColorsDict['secondary']['outline'].default}`
      )}
    >
      {children}
    </_MenuButton>
  );
};

export default MenuButton;

import { useState, JSX, useCallback } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import useClickOutside from '@/shared/lib/hooks/use-click-outside.hook';
import { PFMoreVert } from '@/shared/ui/icons';
import { IconMenu } from '../icon-menu';
import { MenuItem } from '../menu';

interface DisplayOptionMenuOnHoverListenerProps {
  menuConfig: MenuItem[];
  listenerDisabled?: boolean;
  children: (isHover: boolean) => JSX.Element;
  menuPositionStyle?: string;
}

const DisplayOptionMenuOnHoverListener = ({
  menuConfig,
  children,
  menuPositionStyle,
  listenerDisabled = false,
}: DisplayOptionMenuOnHoverListenerProps) => {
  const [isHover, setIsHover] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuIconClick = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
    setIsHover(false);
  }, []);

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const menuRef = useClickOutside<HTMLDivElement>(handleMenuClose);

  return (
    <div
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMenuClose}
      className='relative'
    >
      {children(isHover)}

      {!listenerDisabled && (
        <>
          <div
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-r from-transparent to-black',
              'opacity-from-zero',
              (isHover || isMenuOpen) && 'opacity-100'
            )}
          />

          <IconMenu
            MenuButtonIcon={<PFMoreVert />}
            menuItemConfig={menuConfig}
            onMenuIconClick={handleMenuIconClick}
            onMenuClose={handleMenuClose}
            menuContainerStyle={cn([
              'absolute top-[5px] right-0',
              'opacity-from-zero',
              (isHover || isMenuOpen) && 'opacity-100',
              menuPositionStyle,
            ])}
            ref={menuRef}
            menuItemPanel={{ size: 'md' }}
            menuOpened={isMenuOpen}
          />
        </>
      )}
    </div>
  );
};

export default DisplayOptionMenuOnHoverListener;

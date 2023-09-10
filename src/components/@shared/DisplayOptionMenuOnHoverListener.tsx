import { useState } from 'react';
import Menu, { MenuItem } from '@/components/@shared/Menu';
import { cn } from '@/lib/utils';
import useClickOutside from '../../hooks/useClickOutside';

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

  const handleMenuIconClick = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setIsHover(false);
  };

  const menuRef = useClickOutside<HTMLDivElement>(handleMenuClose);

  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => !isMenuOpen && setIsHover(false)}
      className='relative'
    >
      {children(isHover)}

      {!listenerDisabled && (
        <>
          <div
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-r from-transparent to-gray-900',
              'opacity-from-zero',
              isHover && 'opacity-100'
            )}
          />

          <Menu
            optionMenuConfig={menuConfig}
            onMenuIconClick={handleMenuIconClick}
            onMenuClose={handleMenuClose}
            menuContainerStyle={cn([
              'absolute top-[5px] right-0',
              'opacity-from-zero',
              isHover && 'opacity-100',
              menuPositionStyle,
            ])}
            ref={menuRef}
            size='md'
          />
        </>
      )}
    </div>
  );
};

export default DisplayOptionMenuOnHoverListener;

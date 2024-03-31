import { useState, JSX } from 'react';
import { MenuItem } from '@/components/shared/atoms/menu/menu-item-panel.component';
import IconMenu from '@/components/shared/icon-menu.component';
import { PFMoreVert } from '@/components/shared/icons';
import useClickOutside from '@/hooks/use-click-outside.hook';
import { cn } from '@/utils/cn';

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
      onClick={(e) => {
        // when menu is open and click the container, set the hover state to false
        if (isMenuOpen) {
          setIsHover(false);
          return;
        }
        // keep the hover state when click the container, unless other CTA is triggered
        e.stopPropagation();
      }}
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
              isHover && 'opacity-100'
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
              isHover && 'opacity-100',
              menuPositionStyle,
            ])}
            ref={menuRef}
            menuItemPanel={{ size: 'md' }}
          />
        </>
      )}
    </div>
  );
};

export default DisplayOptionMenuOnHoverListener;

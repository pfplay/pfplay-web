import { useState, ReactElement } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import useClickOutside from '@/shared/lib/hooks/use-click-outside.hook';
import { PFMoreVert } from '@/shared/ui/icons';
import { IconMenu } from '../icon-menu';
import { MenuItem, MenuItemPanelSize } from '../menu';

interface DisplayOptionMenuOnHoverListenerProps {
  menuConfig: MenuItem[];
  listenerDisabled?: boolean;
  children: ReactElement | ((isHover: boolean) => ReactElement);
  menuPositionStyle?: string;
  menuItemPanelSize?: MenuItemPanelSize;
}

const DisplayOptionMenuOnHoverListener = ({
  menuConfig,
  children,
  menuPositionStyle,
  menuItemPanelSize = 'md',
  listenerDisabled = false,
}: DisplayOptionMenuOnHoverListenerProps) => {
  const [isHover, setIsHover] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuIconClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setIsHover(false);
  };

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    // Mouse Leave 시 메뉴가 닫혀있을 때만 hover 상태를 끄도록 함
    if (!isMenuOpen) {
      setIsHover(false);
    }
  };

  const handleClick = () => {
    // 마우스 Hover 상태일 때 컴포넌트 내부 클릭 시 메뉴가 열려있으면 닫히도록 함
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const menuRef = useClickOutside<HTMLDivElement>(handleMenuClose);

  return (
    <div
      ref={menuRef} // 마우스 Hover 상태일 때 컴포넌트 내부 클릭 시 hover 상태가 유지되도록 함
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className='relative'
    >
      {typeof children === 'function' ? children(isHover) : children}

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
            menuItemPanel={{ size: menuItemPanelSize }}
          />
        </>
      )}
    </div>
  );
};

export default DisplayOptionMenuOnHoverListener;

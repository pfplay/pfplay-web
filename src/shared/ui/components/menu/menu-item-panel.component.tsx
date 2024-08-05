import { Fragment, ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { Transition, Menu } from '@headlessui/react';
import { cn } from '@/shared/lib/functions/cn';

// TODO: MenuConfig 정해지면 type 재정의하기
export type MenuItem = { onClickItem: () => void; label: string; Icon?: ReactNode };
export type MenuItemPanelSize = 'lg' | 'md' | 'sm';
const MenuItemBoxSize: Record<MenuItemPanelSize, string> = {
  lg: 'w-[330px]',
  md: 'w-[220px]',
  sm: 'w-[90px]',
};

interface MenuItemPanelProps {
  menuItemConfig: Array<MenuItem>;
  HeaderIcon?: ReactNode;
  MenuItemPrefixIcon?: ReactNode;
  menuItemPanelStyle?: string;
  size?: MenuItemPanelSize;
  close: () => void;
  anchorEl?: HTMLElement | null;
}

const MenuItemPanel = ({
  menuItemConfig,
  HeaderIcon,
  MenuItemPrefixIcon,
  menuItemPanelStyle,
  size = 'lg',
  close,
  anchorEl,
}: MenuItemPanelProps) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!anchorEl) return;

    // 메뉴의 위치를 동적으로 계산해 화면 밖으로 나가지 않도록 조정
    const updatePosition = () => {
      if (anchorEl && menuRef.current) {
        const anchorRect = anchorEl.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        let top = anchorRect.bottom + window.scrollY; // 문서 전체에서의 앵커 요소 하단의 절대적인 위치
        const absoluteLeft = anchorRect.left + window.scrollX; // 문서 전체에서의 앵커 요소 왼쪽의 절대적인 위치
        let left = absoluteLeft - menuRect.width + anchorRect.width; // 메뉴를 앵커 요소의 왼쪽에서 시작하여 왼쪽으로 펼치기 위해 변경. anchorRect.left에서 메뉴의 너비(menuRect.width)를 빼고 앵커의 너비(anchorRect.width)를 더해 메뉴가 앵커의 오른쪽 끝에서 시작하여 왼쪽으로 펼쳐짐

        // 메뉴가 화면 아래로 넘어간다면, 메뉴를 앵커 요소 위에 배치
        if (top + menuRect.height > windowHeight + window.scrollY) {
          top = anchorRect.top - menuRect.height + window.scrollY;
        }

        // 메뉴가 화면 왼쪽으로 넘어간다면, 메뉴를 앵커 요소 오른쪽에 배치
        if (left < window.scrollX) {
          left = anchorRect.right + window.scrollX;
        }

        setMenuPosition({ top, left });
        setIsPositioned(true);
      }
    };

    const handleScroll = () => {
      close();
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.removeEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.addEventListener('scroll', handleScroll, true);
    };
  }, [anchorEl, close]);

  const handleMenuItemClick = (config: MenuItem) => {
    config.onClickItem();
  };

  return (
    <Transition
      as={Fragment}
      enter='transition ease-out duration-100'
      enterFrom='transform opacity-0 scale-95'
      enterTo='transform opacity-100 scale-100'
      leave='transition ease-in duration-75'
      leaveFrom='transform opacity-100 scale-100'
      leaveTo='transform opacity-0 scale-95'
    >
      <Menu.Items
        ref={menuRef}
        as='div'
        className={cn(
          'fixed py-2 origin-top-right rounded-[4px] bg-gray-800 shadow-lg z-50',
          menuItemPanelStyle,
          MenuItemBoxSize[size]
        )}
        style={{
          ...(anchorEl && {
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            maxHeight: '80vh', // 메뉴가 화면을 완전히 차지하지 않도록 제한
            overflowY: 'auto', // 메뉴 내용이 maxHeight를 초과할 경우 세로 스크롤바를 표시
            visibility: isPositioned ? 'visible' : 'hidden',
          }),
        }}
      >
        <ul>
          {HeaderIcon && (
            <div className='px-3 py-[6px]' onClick={() => close()}>
              {HeaderIcon}
            </div>
          )}
          {menuItemConfig.map((config) => (
            <Menu.Item as={Fragment} key={config.label}>
              {({ active }) => (
                <li
                  onClick={() => handleMenuItemClick(config)}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-sm px-4 py-3 cursor-pointer text-gray-50',
                    active && 'bg-gray-700',
                    size === 'sm' && `text-sm`
                  )}
                >
                  {MenuItemPrefixIcon && size !== 'sm' && MenuItemPrefixIcon}

                  <span className='flex items-center gap-2'>
                    {config.Icon}
                    {config.label}
                  </span>
                </li>
              )}
            </Menu.Item>
          ))}
        </ul>
      </Menu.Items>
    </Transition>
  );
};

export default MenuItemPanel;

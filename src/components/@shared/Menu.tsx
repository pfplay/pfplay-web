'use client';
import { Fragment } from 'react';
import { Menu as _Menu, Transition } from '@headlessui/react';
import Icons from '@/components/__legacy__/Icons';
import { cn } from '@/lib/utils';

export type MenuItemBoxSizeKey = 'lg' | 'md' | 'sm';
const MenuItemBoxSize: Record<MenuItemBoxSizeKey, string> = {
  lg: 'w-[330px]',
  md: 'w-[220px]',
  sm: 'w-[90px]',
};

export type MenuItem = { onClickItem: () => void; label: string };
interface MenuProps {
  // TODO:  optionMenuConfig 정해지면 type 재정의하기
  optionMenuConfig: Array<MenuItem>;
  HeaderIcon?: React.ReactNode;
  MenuItemPrefixIcon?: React.ReactNode;
  className?: string;
  size?: MenuItemBoxSizeKey;
}

const Menu = ({
  optionMenuConfig,
  HeaderIcon,
  MenuItemPrefixIcon,
  className,
  size = 'lg',
}: MenuProps) => {
  return (
    <_Menu as='section' className={`relative w-fit`}>
      {({ close }) => (
        <>
          <_Menu.Button className={'flex items-center gap-2 text-gray-50 p-2'}>
            {/* TODO: SVG Icon 사용법 정해지면 대체 */}
            <Icons.option />
          </_Menu.Button>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <_Menu.Items
              as='ul'
              className={cn(
                'absolute right-0 mt-2 py-2 origin-top-right rounded-[4px] bg-gray-800 shadow-lg z-50',
                className,
                MenuItemBoxSize[size]
              )}
            >
              {HeaderIcon && (
                <div className='px-3 py-[6px]' onClick={() => close()}>
                  {HeaderIcon}
                </div>
              )}
              {optionMenuConfig.map((config) => (
                <_Menu.Item as={Fragment} key={config.label}>
                  {({ active }) => (
                    <li
                      onClick={() => config.onClickItem()}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-sm px-4 py-3 cursor-pointer text-gray-50',
                        active && 'bg-gray-700',
                        size === 'sm' && `text-sm`
                      )}
                    >
                      {MenuItemPrefixIcon && size !== 'sm' && MenuItemPrefixIcon}
                      {config.label}
                    </li>
                  )}
                </_Menu.Item>
              ))}
            </_Menu.Items>
          </Transition>
        </>
      )}
    </_Menu>
  );
};

export default Menu;

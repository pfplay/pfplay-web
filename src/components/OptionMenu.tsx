'use client';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '@/lib/utils';
import Icons from './Icons';

export type MenuItemBoxSizeKey = 'lg' | 'md' | 'sm';
const MenuItemBoxSize: Record<MenuItemBoxSizeKey, string> = {
  lg: 'w-[330px]',
  md: 'w-[220px]',
  sm: 'w-[90px]',
};

export type OptionMenuItem = { onClickItem: () => void; label: string };
interface OptionMenuProps {
  // TODO:  optionMenuConfig 정해지면 type 재정의하기
  optionMenuConfig: Array<OptionMenuItem>;
  HeaderIcon?: React.ReactNode;
  MenuItemPrefixIcon?: React.ReactNode;
  className?: string;
  size?: MenuItemBoxSizeKey;
}

const OptionMenu = ({
  optionMenuConfig,
  HeaderIcon,
  MenuItemPrefixIcon,
  className,
  size = 'lg',
}: OptionMenuProps) => {
  return (
    <Menu as='section' className={`relative w-fit`}>
      {({ close }) => (
        <>
          <Menu.Button className={'flex items-center gap-2 text-grey-50 p-2'}>
            {/* TODO: SVG Icon 사용법 정해지면 대체 */}
            <Icons.option />
          </Menu.Button>
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
              as='ul'
              className={cn(
                'absolute right-0 mt-2 py-2 origin-top-right rounded-[4px] bg-grey-800 shadow-lg z-50',
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
                <Menu.Item as={Fragment} key={config.label}>
                  {({ active }) => (
                    <li
                      onClick={() => config.onClickItem()}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-sm px-4 py-3 cursor-pointer text-grey-50',
                        active && 'bg-grey-700',
                        size === 'sm' && `text-sm`
                      )}
                    >
                      {MenuItemPrefixIcon && size !== 'sm' && MenuItemPrefixIcon}
                      {config.label}
                    </li>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default OptionMenu;

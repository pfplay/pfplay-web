'use client';
import Link from 'next/link';
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

interface OptionMenuProps {
  menuItemBoxClassNmae?: string;
  size?: MenuItemBoxSizeKey;
  optionMenuConfig: Array<{ link: string; label: string }>;
}
const OptionMenu = ({ menuItemBoxClassNmae, optionMenuConfig, size = 'lg' }: OptionMenuProps) => {
  return (
    <Menu as='section' className={`relative w-fit`}>
      {({}) => (
        <>
          <Menu.Button className={'flex items-center gap-2 text-grey-50 p-2 bg-red-500'}>
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
              className={cn(
                'absolute right-0 mt-2 py-3 origin-top-right rounded-[4px] bg-grey-800 shadow-lg z-50',
                menuItemBoxClassNmae,
                MenuItemBoxSize[size]
              )}
            >
              {optionMenuConfig.map((config) => (
                <Menu.Item as={Fragment} key={config.label}>
                  {({ active }) => (
                    <Link
                      href={config.link}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-md px-4 py-3 cursor-pointer text-grey-50',
                        active && 'bg-grey-700',
                        size === 'sm' && `text-sm`
                      )}
                    >
                      {size !== 'sm' && <Icons.arrowDown />}
                      {config.label}
                    </Link>
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

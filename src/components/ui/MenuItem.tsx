'use client';
import Link from 'next/link';
import React, { Fragment } from 'react';
import { Menu } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { MenuItemBoxSizeKey } from '../OptionMenu';

export type MenuItem = { label: string; link: string };

interface MenuItemProps {
  menuItem: MenuItem;
  size?: MenuItemBoxSizeKey;
  prefixIcon?: JSX.Element;
}

const MenuItem = ({ menuItem, size, prefixIcon }: MenuItemProps) => {
  const displayPrefixIcon = () => {
    // TODO: size를 반응형 훅으로 받아와서 처리
    if (size === 'sm') return null;

    if (prefixIcon) return prefixIcon;
  };

  return (
    <Menu.Item as={Fragment}>
      {({ active }) => (
        <Link
          href={menuItem.link}
          className={cn(
            'w-full flex items-center gap-2 rounded-md px-4 py-3 cursor-pointer text-grey-50',
            active && 'bg-grey-700',
            size === 'sm' && `text-sm`
          )}
        >
          {displayPrefixIcon()}
          {menuItem.label}
        </Link>
      )}
    </Menu.Item>
  );
};

export default MenuItem;

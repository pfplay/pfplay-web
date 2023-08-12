import Link from 'next/link';
import React, { Fragment } from 'react';
import { Menu } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { MenuSizeKey } from './MenuContainer';

export type MenuItem = { label: string; link: string };

interface MenuItemProps {
  menuItem: MenuItem;
  size?: MenuSizeKey;
}

const MenuItem = ({ menuItem, size }: MenuItemProps) => {
  return (
    <Menu.Item as={Fragment}>
      {({ active }) => (
        <Link
          href={menuItem.link}
          className={cn(
            'w-full flex items-center rounded-md px-4 py-3 cursor-pointer text-grey-50',
            active && 'bg-grey-700',
            size === 'sm' && `text-sm`
          )}
        >
          {menuItem.label}
        </Link>
      )}
    </Menu.Item>
  );
};

export default MenuItem;

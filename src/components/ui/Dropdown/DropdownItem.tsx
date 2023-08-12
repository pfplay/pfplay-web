import React from 'react';
import { Menu } from '@headlessui/react';
import { cn } from '@/lib/utils';

export type DropdownItem = { label: string; value: string };

interface DropdownItemProps {
  dropdownItem: DropdownItem;
}

const DropdownItem = ({ dropdownItem }: DropdownItemProps) => {
  return (
    <Menu.Item as={'div'} key={dropdownItem.value} className={'text-grey-50'}>
      {({ active }) => (
        <button
          className={cn(
            'group flex w-full items-center rounded-md px-4 py-3 text-sm text-grey-50',
            active && 'bg-grey-700'
          )}
        >
          {dropdownItem.label}
        </button>
      )}
    </Menu.Item>
  );
};

export default DropdownItem;

'use client';
import { Fragment, PropsWithChildren } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Icons from '../../Icons';

const dropdownSize: Record<'lg' | 'md' | 'sm', string> = {
  lg: 'w-[330px]',
  md: 'w-[220px]',
  sm: 'w-[90px]',
};

const dropdownButtonVariants = cva(
  'flexRow items-center justify-between w-full px-4 py-3 bg-grey-800 hover:bg-grey-700 text-grey-50 rounded-[4px]',
  {
    variants: {
      variant: {
        accent: 'border-[1px] border-red-500',
        outlined: 'border-[1px] border-grey-500',
      },
      size: {
        ...dropdownSize,
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

export interface DropdownProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof dropdownButtonVariants> {
  prefixIcon?: boolean;
  suffixIcon?: boolean;
  tag?: boolean;
}

const DropdownMenu = ({ className, variant, size, children }: PropsWithChildren<DropdownProps>) => {
  return (
    <Menu as='section' className='relative'>
      {({ open }) => (
        <>
          <Menu.Button className={cn(dropdownButtonVariants({ variant, className, size }))}>
            <div className='flex items-center gap-2'>
              {/* TODO: Add prefix icon */}
              <div className='border rounded-[40px] py-[1.5px] px-2 border-red-400 text-red-300 font-bold'>
                Tag
              </div>
              Options
            </div>
            {open ? <Icons.arrowUp /> : <Icons.arrowDown />}
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
                `absolute right-0 mt-2 py-3 w-full origin-top-right rounded-[4px] bg-grey-800 shadow-lg ${dropdownSize.lg}`,
                size && dropdownSize[size]
              )}
            >
              {children}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default DropdownMenu;

'use client';
import { Fragment, PropsWithChildren } from 'react';
import { Menu as _Menu, Transition } from '@headlessui/react';
import { VariantProps, cva } from 'class-variance-authority';
import Icons from '@/components/Icons';
import { cn } from '@/lib/utils';

export type MenuSizeKey = 'lg' | 'md' | 'sm';
const menuSize: Record<MenuSizeKey, string> = {
  lg: 'w-[330px]',
  md: 'w-[220px]',
  sm: 'w-[90px]',
};

const menuButtonVariants = cva(
  'flexRow items-center justify-between w-full px-4 py-3 bg-grey-800 hover:bg-grey-700 text-grey-50 rounded-[4px]',
  {
    variants: {
      variant: {
        accent: 'border-[1px] border-red-500',
        outlined: 'border-[1px] border-grey-500',
      },
      size: {
        ...menuSize,
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

export interface MenuProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof menuButtonVariants> {
  prefixIcon?: JSX.Element;
  suffixIcon?: JSX.Element;
}

const MenuContainer = ({
  className,
  variant,
  size,
  prefixIcon,
  suffixIcon,
  children,
}: PropsWithChildren<MenuProps>) => {
  const displaySuffixIcon = (isOpen: boolean) => {
    if (size === 'sm') return null;

    if (suffixIcon) return suffixIcon;

    return isOpen ? <Icons.arrowUp /> : <Icons.arrowDown />;
  };

  return (
    <_Menu
      as='section'
      className={cn(`relative ${menuSize.lg}`, size && menuSize[size], size === 'sm' && `text-sm`)}
    >
      {({ open }) => (
        <>
          <_Menu.Button className={cn(menuButtonVariants({ variant, className, size }))}>
            <div className='flex items-center gap-2'>
              {prefixIcon && prefixIcon}
              Options
            </div>
            {displaySuffixIcon(open)}
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
              className={cn(
                `absolute right-0 mt-2 py-3 w-full origin-top-right rounded-[4px] bg-grey-800 shadow-lg ${menuSize.lg}`,
                size && menuSize[size]
              )}
            >
              {children}
            </_Menu.Items>
          </Transition>
        </>
      )}
    </_Menu>
  );
};

export default MenuContainer;

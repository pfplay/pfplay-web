'use client';
import { PropsWithChildren, ReactNode } from 'react';
import { Disclosure } from '@headlessui/react';
import { cn } from '@/shared/lib/functions/cn';
import { PFChevronDown, PFChevronUp } from '@/shared/ui/icons';
import { Typography } from '../typography';

type CollapseListProps = {
  variant?: 'default' | 'accent' | 'outlined';
  PrefixIcon?: ReactNode;
  title: string;
  infoText?: string;
};

const CollapseList = ({
  title,
  PrefixIcon,
  infoText,
  variant = 'default',
  children,
}: PropsWithChildren<CollapseListProps>) => {
  return (
    <Disclosure as='div' className='mx-auto w-full max-w-md bg-transparent'>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={cn(
              'w-full flexRow justify-between items-center px-4 py-3 rounded bg-gray-800 text-left text-gray-50 hover:bg-gray-700 ',
              variant === 'default' && 'border-none',
              variant === 'accent' && 'border-[1px] border-red-500',
              variant === 'outlined' && 'border-[1px] border-gray-500'
            )}
          >
            <span className='w-4/5 flexRow items-center gap-2'>
              {PrefixIcon && PrefixIcon}
              <Typography type='detail1' overflow='ellipsis'>
                {title}
              </Typography>
            </span>
            <span className='flexRow items-center gap-2'>
              {infoText && (
                <Typography className='text-gray-300 whitespace-nowrap'>{infoText}</Typography>
              )}
              {open ? (
                <PFChevronUp width={16} height={8} />
              ) : (
                <PFChevronDown width={16} height={8} />
              )}
            </span>
          </Disclosure.Button>
          <div className='space-y-3 [&>:first-child]:pt-3'>{children}</div>
        </>
      )}
    </Disclosure>
  );
};

export default CollapseList;

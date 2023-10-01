'use client';
import React, { PropsWithChildren } from 'react';
import { Disclosure } from '@headlessui/react';
import { cn } from '@/utils/cn';
import Typography from './@atoms/Typography';
import Icons from '../__legacy__/Icons';

type CollapseListProps = {
  variant?: 'default' | 'accent' | 'outlined';
  PrefixIcon?: React.ReactNode;
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
              {infoText && <Typography className='text-gray-300'>{infoText}</Typography>}
              {open ? (
                <Icons.arrowUp width={16} height={8} />
              ) : (
                <Icons.arrowDown width={16} height={8} />
              )}
            </span>
          </Disclosure.Button>
          <div className='py-3 space-y-3'>{children}</div>
        </>
      )}
    </Disclosure>
  );
};

export default CollapseList;
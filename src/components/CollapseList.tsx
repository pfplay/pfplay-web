'use client';
import React from 'react';
import { Disclosure } from '@headlessui/react';
import { cn } from '@/lib/utils';
import Icons from './Icons';
import Typography from './ui/Typography';

export type ListPanel = {
  id: string;
  title: string;
  thumbnail: string;
  alt: string;
  duration: string;
};

interface CollapseListProps {
  variant?: 'default' | 'accent' | 'outlined';
  PrefixIcon?: React.ReactNode;
  title: string;
  infoText?: string;
  listPanelConfig: Array<ListPanel>;
}

const CollapseList = ({
  title,
  PrefixIcon,
  infoText,
  listPanelConfig,
  variant = 'default',
}: CollapseListProps) => {
  return (
    <Disclosure as='div' className='mx-auto w-full max-w-md bg-black'>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={cn(
              'w-full flexRow justify-between items-center px-4 py-3 rounded-[4px] bg-grey-800 text-left text-grey-50 hover:bg-grey-700 ',
              variant === 'default' && 'border-none',
              variant === 'accent' && 'border-[1px] border-red-500',
              variant === 'outlined' && 'border-[1px] border-grey-500'
            )}
          >
            <span className='w-4/5 flexRow items-center gap-2'>
              {PrefixIcon && PrefixIcon}
              <Typography type='detail1' overflow='ellipsis'>
                {title}
              </Typography>
            </span>
            <span className='flexRow items-center gap-2'>
              {infoText && <Typography className='text-grey-300'>{infoText}</Typography>}
              {open ? (
                <Icons.arrowUp width={16} height={8} />
              ) : (
                <Icons.arrowDown width={16} height={8} />
              )}
            </span>
          </Disclosure.Button>
          {listPanelConfig.map((config) => (
            <Disclosure.Panel key={config.id} as='article' className='py-3  text-grey-200'>
              <div className='relative flexRow justify-start gap-3 rounded-[4px]'>
                {/* TODO: thumbnail, alt가 있을 경우 <Image /> 컴포넌트로 대체 */}
                <div className='w-20 h-11 bg-blue-500' />

                <Typography type='caption1' className='w-4/6 text-left'>
                  {config.title}
                </Typography>
                <Typography type='caption1' className='absolute bottom-0 right-0 text-grey-400'>
                  {config.duration}
                </Typography>
              </div>
            </Disclosure.Panel>
          ))}
        </>
      )}
    </Disclosure>
  );
};

export default CollapseList;

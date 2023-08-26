'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import Typography from './Typography';

export type TagProps =
  | {
      value: string;
    } & (
      | {
          variant: 'profile';
          prefixIcon: React.ReactNode;
        }
      | {
          variant: 'filled' | 'outlined';
        }
    );

const Tag = (props: TagProps) => {
  if (props.variant === 'profile') {
    return (
      <div className={cn('w-fit flexRowCenter rounded-[40px] py-1 px-2 gap-1 bg-black')}>
        <div className='flexRowCenter w-5 h-5 rounded-full'>{props.prefixIcon}</div>
        <Typography type='caption1' className={'text-grey-100'}>
          {props.value}
        </Typography>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-fit rounded-[40px] py-[2px] px-2',
        props.variant === 'filled' && 'bg-red-400',
        props.variant === 'outlined' && 'border border-red-400 text-red-300'
      )}
    >
      <Typography
        type='caption1'
        className={cn(
          'font-semibold',
          props.variant === 'filled' && 'text-grey-50',
          props.variant === 'outlined' && 'text-red-300'
        )}
      >
        {props.value}
      </Typography>
    </div>
  );
};

export default Tag;

'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps {
  variant?: 'filled' | 'outlined';
  value: string;
}

const Chip = ({ value, variant = 'filled' }: ChipProps) => {
  return (
    <div
      className={cn(
        'w-fit rounded-[40px] py-[2px] px-2 font-semibold text-sm leading-[21px]',
        variant === 'filled' && 'bg-red-400 text-grey-50',
        variant === 'outlined' && 'border border-red-400 text-red-300'
      )}
    >
      {value}
    </div>
  );
};

export default Chip;

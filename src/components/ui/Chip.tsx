import React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps {
  variant: 'filled' | 'outlined';
  value: string;
}

const Chip = ({ value, variant }: ChipProps) => {
  return (
    <div
      className={cn(
        'rounded-[40px] py-[1.5px] px-2 font-semibold',
        variant === 'filled' && 'bg-red-400 text-grey-50',
        variant === 'outlined' && 'border border-red-400 text-red-300'
      )}
    >
      {value}
    </div>
  );
};

export default Chip;

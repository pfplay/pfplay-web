'use client';
import { ReactNode } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';

type ListItemProps = {
  title: string;
  variant?: 'default' | 'accent' | 'outlined';
  PrefixIcon?: ReactNode;
  InfoText?: ReactNode;
  onClick?: () => void;
};

const ListItem = ({ title, variant, PrefixIcon, InfoText, onClick }: ListItemProps) => {
  return (
    <div
      role={onClick && 'button'}
      tabIndex={onClick && 0}
      onClick={onClick}
      className={cn('mx-auto w-full max-w-md bg-transparent', {
        'cursor-pointer': !!onClick,
      })}
    >
      <div
        className={cn(
          'w-full flexRow justify-between items-center px-4 py-3 rounded bg-gray-800 text-left text-gray-50',
          {
            'border-none': variant === 'default',
            'border-[1px] border-red-500': variant === 'accent',
            'border-[1px] border-gray-500': variant === 'outlined',
          },
          {
            'hover:bg-gray-700': !!onClick,
          }
        )}
      >
        <span className='w-4/5 flexRow items-center gap-2'>
          {PrefixIcon && PrefixIcon}
          <Typography type='detail1' overflow='ellipsis'>
            {title}
          </Typography>
        </span>
        <span className='flexRow items-center gap-2'>
          {InfoText && (
            <Typography className='text-gray-300 whitespace-nowrap'>{InfoText}</Typography>
          )}
        </span>
      </div>
    </div>
  );
};

export default ListItem;

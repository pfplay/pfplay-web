'use client';

import Typography from '@/components/shared/atoms/typography.component';
import { cn } from '@/utils/cn';

interface CommonProps {
  value: string;
  className?: string;
}
interface ProfileProps {
  variant: 'profile';
  PrefixIcon: React.ReactNode;
}
interface NonProfileProps {
  variant: 'filled' | 'outlined';
}
export type TagProps = (CommonProps & ProfileProps) | (CommonProps & NonProfileProps);

const Tag = (props: TagProps) => {
  if (props.variant === 'profile') {
    return (
      <div
        className={cn(
          'w-fit flexRowCenter rounded-[40px] py-1 px-2 gap-1 bg-black',
          props.className
        )}
      >
        <div className='flexRowCenter w-5 h-5 rounded-full'>{props.PrefixIcon}</div>
        <Typography type='caption1' className={'text-gray-100'}>
          {props.value}
        </Typography>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-fit rounded-[40px] py-[2px] px-2',
        props.className,
        props.variant === 'filled' && 'bg-red-400',
        props.variant === 'outlined' && 'border border-red-400 text-red-300'
      )}
    >
      <Typography
        type='caption1'
        className={cn(
          'font-semibold',
          props.variant === 'filled' && 'text-gray-50',
          props.variant === 'outlined' && 'text-red-300'
        )}
      >
        {props.value}
      </Typography>
    </div>
  );
};

export default Tag;

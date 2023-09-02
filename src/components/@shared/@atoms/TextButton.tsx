'use client';
import type { ComponentProps, ReactNode } from 'react';
import { forwardRef } from 'react';
import Loading from '@/components/@shared/@atoms/Loading';
import Typography from '@/components/@shared/@atoms/Typography';
import { cn } from '@/lib/utils';

type TextButtonColor = 'basic' | 'primary' | 'secondary';

type ButtonHTMLProps = ComponentProps<'button'>;
export interface TextButtonProps extends Omit<ButtonHTMLProps, 'color' | 'children'> {
  children: string;
  color?: TextButtonColor;
  Icon?: ReactNode;
  iconPlacement?: 'left' | 'right';
  loading?: boolean;
  underline?: boolean;
}

const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  (
    {
      className,
      children,
      color = 'basic',
      Icon,
      iconPlacement = 'left',
      loading,
      underline,
      disabled,
      onClick,
      ...rest
    },
    ref
  ) => {
    const interactable = !(disabled || loading);

    return (
      <button
        ref={ref}
        className={cn(
          'flex h-max items-center justify-center gap-[8px]',
          '[&>svg]:w-[16px] [&>svg]:h-[16px]',

          colorsDict[color],
          interactable && 'transition-transform active:scale-[0.96]',
          !interactable && '!cursor-not-allowed',
          disabled && '!text-gray-700',

          underline && 'underline',

          className
        )}
        disabled={disabled || loading}
        onClick={(e) => {
          if (disabled || loading) return;
          onClick?.(e);
        }}
        {...rest}
      >
        {loading ? <Loading /> : iconPlacement === 'left' && Icon}

        <Typography type='detail1' overflow='break-normal'>
          {children}
        </Typography>

        {iconPlacement === 'right' && Icon}
      </button>
    );
  }
);

const colorsDict: Record<TextButtonColor, string> = {
  basic: 'text-white',
  primary: 'text-red-300',
  secondary: 'text-gray-300',
};

export default TextButton;

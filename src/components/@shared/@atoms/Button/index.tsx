'use client';
import type { ComponentProps, ReactNode } from 'react';
import { forwardRef } from 'react';
import Loading from '@/components/@shared/@atoms/Loading';
import Typography from '@/components/@shared/@atoms/Typography';
import { cn } from '@/lib/utils';
import { colorsDict, iconSizeDict, sizeDict, typoTypeDict } from './Button.config';
import { getDisabledStyles } from './Button.helper';
import { ButtonColor, ButtonVariant, ButtonSize } from './Button.types';

type ButtonHTMLProps = ComponentProps<'button'>;
export interface ButtonProps extends Omit<ButtonHTMLProps, 'color' | 'children'> {
  children?: string;
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  Icon?: ReactNode;
  iconPlacement?: 'left' | 'right';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      color = 'primary',
      variant = 'fill',
      size = 'md',
      Icon,
      iconPlacement = 'left',
      loading,
      disabled,
      onClick,
      ...rest
    },
    ref
  ) => {
    const iconOnly = !children && !!Icon;
    const interactable = !(disabled || loading);

    return (
      <button
        ref={ref}
        className={cn(
          'flex h-max items-center justify-center gap-[8px] rounded-[4px]',

          iconOnly && 'py-[6px] px-[12px] [&>svg]:w-[20px] [&>svg]:h-[20px]',
          !iconOnly && [sizeDict[size], iconSizeDict[size]],

          variant === 'outline' && 'border border-solid',

          colorsDict[color][variant].default,
          interactable && [
            colorsDict[color][variant].hover,
            colorsDict[color][variant].active,
            'transition-transform active:scale-[0.96]',
          ],
          !interactable && '!cursor-not-allowed',

          getDisabledStyles(color, variant, disabled),

          className
        )}
        disabled={disabled || loading}
        onClick={(e) => {
          if (!interactable) return;
          onClick?.(e);
        }}
        {...rest}
      >
        {loading ? <Loading /> : iconPlacement === 'left' && Icon}

        <Typography type={typoTypeDict[size]} overflow='break-normal'>
          {children}
        </Typography>

        {iconPlacement === 'right' && Icon}
      </button>
    );
  }
);

export default Button;

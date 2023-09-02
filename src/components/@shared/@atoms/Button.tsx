'use client';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { forwardRef } from 'react';
import Loading from '@/components/@shared/@atoms/Loading';
import Typography, { TypographyType } from '@/components/@shared/@atoms/Typography';
import { cn } from '@/lib/utils';

type ButtonColor = 'primary' | 'secondary';
type ButtonVariant = 'fill' | 'outline';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

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

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
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

const typoTypeDict: Record<ButtonSize, TypographyType> = {
  xs: 'caption1',
  sm: 'caption1',
  md: 'detail1',
  lg: 'body3',
  xl: 'body1',
};
const sizeDict: Record<ButtonSize, string> = {
  xs: 'px-[8px] h-[28px]',
  sm: 'px-[12px] h-[32px]',
  md: 'px-[16px] h-[36px]',
  lg: 'px-[16px] h-[48px]',
  xl: 'px-[16px] h-[56px]',
};
const iconSizeDict: Record<ButtonSize, string> = {
  xs: '[&>svg]:w-[24px] [&>svg]:h-[24px]',
  sm: '[&>svg]:w-[24px] [&>svg]:h-[24px]',
  md: '[&>svg]:w-[16px] [&>svg]:h-[16px]',
  lg: '[&>svg]:w-[14px] [&>svg]:h-[14px]',
  xl: '[&>svg]:w-[14px] [&>svg]:h-[14px]',
};
type ButtonState = 'default' | 'hover' | 'active';
const colorsDict: Record<ButtonColor, Record<ButtonVariant, Record<ButtonState, string>>> = {
  primary: {
    fill: {
      default: 'text-gray-50 bg-gradient-red',
      hover: 'hover:text-gray-50 hover:bg-none hover:bg-red-400',
      active: 'active:text-gray-50 active:bg-none active:bg-red-500',
    },
    outline: {
      default: 'text-red-300 border-red-300',
      hover: 'hover:text-red-200 hover:border-red-200',
      active: 'active:text-red-400 active:border-red-400',
    },
  },
  secondary: {
    fill: {
      default: 'text-gray-50 bg-gray-700',
      hover: 'hover:text-gray-50 hover:bg-none hover:bg-gray-600',
      active: 'active:text-gray-50 active:bg-none active:bg-gray-700',
    },
    outline: {
      default: 'text-gray-50 border-gray-500',
      hover: 'hover:text-gray-50 hover:border-gray-400',
      active: 'active:text-gray-50 active:border-gray-600',
    },
  },
};
function getDisabledStyles(color: ButtonColor, variant: ButtonVariant, disabled?: boolean) {
  if (!disabled) return;

  const disabledColorsDict: Record<ButtonColor, Record<ButtonVariant, string>> = {
    primary: {
      fill: '!text-gray-600 !bg-none !bg-gray-800',
      outline: '!text-gray-600 !border-gray-700',
    },
    secondary: {
      fill: '!text-gray-700 !bg-none !bg-gray-900',
      outline: '!text-gray-700 !border-gray-800',
    },
  };

  return disabledColorsDict[color][variant];
}

export default Button;

import { ButtonColor, ButtonSize, ButtonVariant } from './Button.types';
import { TypographyType } from '../Typography';

type ButtonState = 'default' | 'hover' | 'active';
export const colorsDict: Record<ButtonColor, Record<ButtonVariant, Record<ButtonState, string>>> = {
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

export const typoTypeDict: Record<ButtonSize, TypographyType> = {
  xs: 'caption1',
  sm: 'caption1',
  md: 'detail1',
  lg: 'body3',
  xl: 'body1',
};

export const sizeDict: Record<ButtonSize, string> = {
  xs: 'px-[8px] h-[28px]',
  sm: 'px-[12px] h-[32px]',
  md: 'px-[16px] h-[36px]',
  lg: 'px-[16px] h-[48px]',
  xl: 'px-[16px] h-[56px]',
};

export const iconSizeDict: Record<ButtonSize, string> = {
  xs: '[&>svg]:w-[24px] [&>svg]:h-[24px]',
  sm: '[&>svg]:w-[24px] [&>svg]:h-[24px]',
  md: '[&>svg]:w-[16px] [&>svg]:h-[16px]',
  lg: '[&>svg]:w-[14px] [&>svg]:h-[14px]',
  xl: '[&>svg]:w-[14px] [&>svg]:h-[14px]',
};

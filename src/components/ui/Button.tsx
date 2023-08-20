'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  ['flexRowCenter', 'rounded', 'capitalize', 'text-grey-50', 'border-transparent'],
  {
    variants: {
      intent: {
        // FIXME : primary hover시 bg-gradient 색상 변경이 아닌 bg color 변경으로 가능 여부 확인 필요
        primary: ['bg-gradient-red', 'hover:bg-gradient-to-tr from-red-400 to-red-400'],
        'primary-disabled': ['bg-grey-800', 'text-grey-600'],
        'primary-outline': [
          'text-red-400',
          'border-solid',
          'border',
          'border-red-400',
          'hover:border-red-200',
          'hover:text-red-200',
        ],
        'primary-outline-disabled': ['text-grey-700', 'border-solid', 'border', 'border-grey-700'],
        secondary: ['bg-grey-700', 'hover:bg-grey-600'],
        'secondary-disabled': ['bg-grey-900', 'text-grey-700'],
        'secondary-outline': ['border-solid', 'border', 'border-grey-600', 'hover:border-grey-400'],
        'secondary-outline-disabled': [
          'border-solid',
          'border',
          'text-grey-800',
          'border-grey-800',
        ],
      },
      size: {
        xLarge: ['px-4', 'py-[13px]', 'text-[20px]/[130%]', 'font-bold'],
        large: ['px-4', 'py-3', 'text-base', 'font-bold'],
        medium: ['px-4', 'py-[6px]', 'text-base', 'font-normal'],
        small: ['px-3', 'py-[5.5px]', 'text-sm/[150%]', 'font-normal'],
        xSmall: ['px-2', 'py-[3.5px]', 'text-sm/[21px]', 'font-normal'],
      },
      fullWidth: {
        true: ['w-full'],
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'xLarge',
    },
    compoundVariants: [
      {
        intent: ['primary', 'primary-outline', 'secondary', 'secondary-outline'],
        size: 'xLarge',
      },
    ],
  }
);

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({
  className,
  intent,
  fullWidth,
  size,
  children,
  ...props
}: React.PropsWithChildren<ButtonProps>) => {
  return (
    <button className={cn(buttonVariants({ intent, fullWidth, size, className }))} {...props}>
      {children}
    </button>
  );
};
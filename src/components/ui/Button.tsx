'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'flexRowCenter',
    'rounded-[4px]',
    'capitalize',
    'text-grey-1',
    'text-base',
    'font-bold',
    'border-transparent',
  ],
  {
    variants: {
      intent: {
        text: [],
        primary: ['bg-gradient-red'],
        secondary: ['bg-grey-8'],
        outlined: ['border-[1px]', 'border-grey-5'],
      },
      size: {
        base: ['px-[68px]', 'py-[10px]'],
      },
      fullWidth: {
        true: ['w-full'],
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'base',
    },
    compoundVariants: [
      {
        intent: ['primary', 'secondary', 'text', 'outlined'],
        size: 'base',
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

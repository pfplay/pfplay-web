'use client';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

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
        primary: ['bg-gradient-red'],
        secondary: ['bg-grey-8'],
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
        intent: ['primary', 'secondary'],
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


'use client';
import type { ComponentProps, PropsWithChildren } from 'react';

export interface ButtonProps extends ComponentProps<'button'> {}

const Button = ({ children, ...props }: PropsWithChildren<ButtonProps>) => {
  return <button {...props}>{children}</button>;
};

export default Button;

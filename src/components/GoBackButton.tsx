import React from 'react';
import { cn } from '@/lib/utils';
import Icons from './Icons';

interface GoBackButtonProps extends React.ComponentProps<'button'> {
  text: string;
}

const GoBackButton = ({ text, className, ...props }: GoBackButtonProps) => {
  return (
    // Button component 준비되면 교체
    <button
      className={cn('text-2xl flex items-center mb-8 w-full text-white', className)}
      {...props}
    >
      <Icons.arrowLeft />
      {text}
    </button>
  );
};

export default GoBackButton;

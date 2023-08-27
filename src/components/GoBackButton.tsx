'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';
import Icons from './Icons';
interface GoBackButtonProps extends React.ComponentProps<'button'> {
  text: string;
}

const GoBackButton = ({ text, className, ...props }: GoBackButtonProps) => {
  const router = useRouter();

  return (
    // Button component 준비되면 교체
    <button
      onClick={() => router.back()}
      className={cn('text-2xl flex items-center text-gray-50', className)}
      {...props}
    >
      <Icons.arrowLeft />
      {text}
    </button>
  );
};

export default GoBackButton;

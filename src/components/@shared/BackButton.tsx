'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { cn } from '@/utils/cn';
import TextButton from './@atoms/TextButton';
import Icons from '../__legacy__/Icons';

interface GoBackButtonProps {
  text: string;
  className?: string;
}

const BackButton = ({ text, className }: GoBackButtonProps) => {
  const router = useRouter();

  return (
    <TextButton
      Icon={<Icons.arrowLeft width={32} height={32} />}
      onClick={() => router.back()}
      className={cn('gap-5', className)}
      typographyType='title2'
    >
      {text}
    </TextButton>
  );
};

export default BackButton;

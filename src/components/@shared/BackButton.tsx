'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { PFArrowLeft } from '@/components/@shared/@icons';
import { cn } from '@/utils/cn';
import TextButton from './@atoms/TextButton';

interface GoBackButtonProps {
  text: string;
  className?: string;
}

const BackButton = ({ text, className }: GoBackButtonProps) => {
  const router = useRouter();

  return (
    <TextButton
      Icon={<PFArrowLeft width={32} height={32} />}
      onClick={() => router.back()}
      className={cn('gap-5', className)}
      typographyType='title2'
    >
      {text}
    </TextButton>
  );
};

export default BackButton;

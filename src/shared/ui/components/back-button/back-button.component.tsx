'use client';
import { useRouter } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import { PFArrowLeft } from '@/shared/ui/icons';
import { TextButton } from '../text-button';

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

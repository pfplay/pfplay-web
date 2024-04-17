'use client';
import { useRouter } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import TextButton from '@/shared/ui/components/text-button/text-button.component';
import { PFArrowLeft } from '@/shared/ui/icons';

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

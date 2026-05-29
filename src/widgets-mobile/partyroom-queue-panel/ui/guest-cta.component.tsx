'use client';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { Typography } from '@/shared/ui/components/typography';

const GuestCta: FC = () => {
  const router = useRouter();
  return (
    <button
      type='button'
      data-testid='guest-cta'
      onClick={() => router.push('/sign-in')}
      className='shrink-0 m-4 p-4 border border-gray-700 rounded text-center hover:bg-gray-900'
    >
      <Typography type='body3'>🎧 음악을 직접 틀어보세요</Typography>
      <Typography type='detail1' className='text-primary-300 mt-2'>
        3초만에 가입 →
      </Typography>
    </button>
  );
};

export default GuestCta;

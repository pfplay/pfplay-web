'use client';

import { Typography } from '@/shared/ui/components/typography';

export default function RefreshButton() {
  return (
    <Typography type='caption1' className='text-gray-500'>
      점검이 완료되었나요?{' '}
      <button
        onClick={() => {
          window.location.href = '/';
        }}
        className='text-red-300 underline underline-offset-2 font-semibold'
      >
        새로고침
      </button>
    </Typography>
  );
}

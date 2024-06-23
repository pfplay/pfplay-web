'use client';

import { useEffect } from 'react';
import isAuthError from '@/shared/api/is-auth-error';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (isAuthError(error) && location.pathname !== '/') {
      location.href = '/';
    }
  }, [error]);

  return (
    <div className='h-screen flexColCenter gap-[10px]'>
      <Typography type='title2'>Something went wrong!</Typography>
      <Button variant='fill' color='primary' onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}

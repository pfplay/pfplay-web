'use client';

import { useEffect } from 'react';
import { getErrorMessage } from '@/shared/api/get-error-message';
import isAuthError from '@/shared/api/is-auth-error';
import { cn } from '@/shared/lib/functions/cn';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (isAuthError(error) && location.pathname !== '/') {
      location.href = '/';
    }
  }, [error]);

  return (
    <div className='h-screen flexColCenter gap-[10px] p-[20px]'>
      <Typography type='title2'>Something went wrong!</Typography>
      <Button variant='fill' color='primary' onClick={() => reset()}>
        Try again
      </Button>

      {process.env.NODE_ENV === 'development' && (
        <Typography
          type='caption1'
          overflow='break-words'
          className={cn(
            'relative min-w-[400px] w-max max-w-full bg-gray-700 text-gray-200 p-[20px] rounded-b mt-[20px]',
            'before:content-["Error_Message"] before:absolute before:z-1',
            'before:-top-[20px] before:left-0'
          )}
        >
          {getErrorMessage(error)}
        </Typography>
      )}
    </div>
  );
}

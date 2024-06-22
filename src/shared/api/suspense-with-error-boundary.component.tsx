'use client';
import { PropsWithChildren, ReactNode, Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { Loading } from '@/shared/ui/components/loading';
import { Typography } from '@/shared/ui/components/typography';

interface ErrorFallbackProps {
  error: unknown;
  enableReload?: boolean;
  enableErrorDialog?: boolean;
}

const ErrorFallback = async ({ error, enableReload, enableErrorDialog }: ErrorFallbackProps) => {
  const { openErrorDialog } = useDialog();

  const message = enableReload
    ? 'Something went wrong. Please click "Reload" button.'
    : 'Something went wrong. Please try again after sometime.';

  useEffect(() => {
    if (enableErrorDialog && error) {
      openErrorDialog(error);
    }
  }, [enableErrorDialog, error, openErrorDialog]);

  return (
    <div className='flexColCenter w-full h-full'>
      <Loading size='1.33em' />

      <Typography className='mt-[24px]'>{message}</Typography>

      {enableReload && typeof window !== 'undefined' && (
        <Button className='mt-[12px]' onClick={() => location.reload()}>
          Reload
        </Button>
      )}
    </div>
  );
};

interface Props {
  fallback?: NonNullable<ReactNode>;
  enableReload?: boolean;
  enableErrorDialog?: boolean;
}

const SuspenseWithErrorBoundary = ({
  fallback = (
    <div className='flexRowCenter w-full h-full'>
      <Loading />
    </div>
  ),
  enableReload,
  enableErrorDialog = true,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <ErrorFallback
          error={error}
          enableReload={enableReload}
          enableErrorDialog={enableErrorDialog}
        />
      )}
    >
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};

export default SuspenseWithErrorBoundary;

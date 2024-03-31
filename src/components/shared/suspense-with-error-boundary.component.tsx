'use client';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { PropsWithChildren, ReactNode, Suspense, useEffect } from 'react';
import Button from '@/components/shared/atoms/button.component';
import Loading from '@/components/shared/atoms/loading.component';
import Typography from '@/components/shared/atoms/typography.component';
import { useDialog } from '@/hooks/use-dialog.hook';

interface ErrorFallbackProps {
  error: unknown;
  enableReload?: boolean;
  enableErrorDialog?: boolean;
}

const ErrorFallback = ({ error, enableReload, enableErrorDialog }: ErrorFallbackProps) => {
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
      errorComponent={({ error }) => (
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

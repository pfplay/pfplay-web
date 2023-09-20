import { PropsWithChildren, ReactNode, Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import Button from '@/components/@shared/@atoms/Button';
import Loading from '@/components/@shared/@atoms/Loading';
import { useDialog } from 'hooks/useDialog';

interface ErrorFallbackProps {
  resetErrorBoundary: (...args: any[]) => void;
  error: unknown;
  enableReset?: boolean;
  enableErrorDialog?: boolean;
  errorDialogCallback?: () => void;
}

const ErrorFallback = ({
  resetErrorBoundary,
  error,
  enableReset,
  enableErrorDialog,
  errorDialogCallback,
}: ErrorFallbackProps) => {
  const { openErrorDialog } = useDialog();

  const message = enableReset
    ? 'Something went wrong. Please click "Try Again" button.'
    : 'Something went wrong. Please try again after sometime.';

  useEffect(() => {
    if (enableErrorDialog && error) {
      openErrorDialog(error).finally(() => {
        errorDialogCallback?.();
      });
    }
  }, [enableErrorDialog, error]);

  return (
    <div>
      <Loading size={30} />

      <div className='mt-[10px]'>{message}</div>
      {enableReset && (
        <Button onClick={() => resetErrorBoundary()} className='mt-[10px]'>
          Try Again
        </Button>
      )}
    </div>
  );
};

interface Props {
  fallback: NonNullable<ReactNode> | null;
  enableReset?: boolean;
  enableErrorDialog?: boolean;
  errorDialogCallback?: () => void;
}

const QuerySuspenseWithErrorBoundary = ({
  fallback,
  enableReset,
  enableErrorDialog,
  errorDialogCallback,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <ErrorFallback
              resetErrorBoundary={resetErrorBoundary}
              error={error}
              enableReset={enableReset}
              enableErrorDialog={enableErrorDialog}
              errorDialogCallback={errorDialogCallback}
            />
          )}
        >
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default QuerySuspenseWithErrorBoundary;

import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { PropsWithChildren, ReactElement, useCallback } from 'react';

import CustomSuspense from './CustomSuspense';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

interface AsyncBoundaryProps {
  children: ReactElement;
}

const AsyncBoundary = ({ children }: PropsWithChildren<AsyncBoundaryProps>) => {
  const { reset } = useQueryErrorResetBoundary();
  const resetHandler = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <ErrorBoundary resetQuery={resetHandler} errorFallback={<ErrorFallback />}>
      <CustomSuspense fallback={<span>loading...</span>}>{children}</CustomSuspense>
    </ErrorBoundary>
  );
};

export default AsyncBoundary;

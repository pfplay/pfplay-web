'use client';

import { PropsWithChildren, useState } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getErrorMessage } from '@/shared/api/get-error-message';
import isAuthError from '@/shared/api/is-auth-error';
import { FIVE_MINUTES } from '@/shared/config/time';

export function ReactQueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /**
             * @see https://tanstack.com/query/latest/docs/react/guides/advanced-ssr
             *
             * With SSR, we usually want to set some default staleTime
             * above 0 to avoid refetching immediately on the client
             *
             */
            staleTime: FIVE_MINUTES,
            refetchOnWindowFocus: false,
            retry: process.env.NODE_ENV === 'development' ? false : 3,
          },
        },
        queryCache: new QueryCache({
          onError: handleBubbledError,
        }),
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

/**
 * TODO: will - alert >> errorDialog 변경
 * 이 파일 내에서 useDialog를 사용하려면 app/lagout.tsx 내 provider의 위게를 변경하여 QueryClientProvider를 DialogProvider 내부로 이동해야 하는데,
 * 이러면 다이얼로그 body 내에서 react-query를 사용할 수 없음 (Error: No QueryClient set, use QueryClientProvider to set one)
 * dialog를 provider가 아닌 다른 방식으로 제공하는걸 검토해봐야 할 듯
 */
function handleBubbledError(error: unknown) {
  const errorMessage = `[ERROR]\n${getErrorMessage(error)}`;

  if (typeof window === 'undefined') {
    console.error(errorMessage);
    return;
  }

  if (isAuthError(error)) {
    if (location.pathname !== '/') {
      location.href = '/';
    }
    return;
  }

  alert(errorMessage);
}

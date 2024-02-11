'use client';

import { PropsWithChildren, useRef } from 'react';
import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const config: QueryClientConfig = {
  defaultOptions: {
    queries: {
      /**
       * @see https://tanstack.com/query/latest/docs/react/guides/advanced-ssr
       *
       * With SSR, we usually want to set some default staleTime
       * above 0 to avoid refetching immediately on the client
       *
       */
      staleTime: 60 * 1000,
    },
  },
};

export function ReactQueryProvider({ children }: PropsWithChildren) {
  const client = useRef(new QueryClient(config)).current;

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

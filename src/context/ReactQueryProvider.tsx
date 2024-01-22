'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [client] = React.useState(
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
          staleTime: 60 * 1000,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

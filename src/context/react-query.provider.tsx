'use client';

import { PropsWithChildren, useState } from 'react';
import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { FIVE_MINUTES } from '@/constants/time';

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
      staleTime: FIVE_MINUTES,
      refetchOnWindowFocus: false,
    },
  },
};

export function ReactQueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient(config));

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

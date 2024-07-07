'use client';
import { ReactNode } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { getErrorMessage } from '@/shared/api/get-error-message';
import isAuthError from '@/shared/api/is-auth-error';
import { FIVE_MINUTES } from '@/shared/config/time';

/**
 * @see https://github.com/TanStack/query/issues/6116#issuecomment-1904051005
 */
export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}

function makeQueryClient() {
  return new QueryClient({
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
        retry: (failureCount, error) => {
          if (process.env.NODE_ENV === 'development') return false;
          if (isAuthError(error)) return false;
          return failureCount <= 3;
        },
      },
    },
    queryCache: new QueryCache({
      onError: handleBubbledError,
    }),
  });
}

let clientQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  if (!clientQueryClient) clientQueryClient = makeQueryClient();
  return clientQueryClient;
}

/**
 * TODO: will - alert >> errorDialog 변경
 * 이 파일 내에서 useDialog를 사용하려면 app/logout.tsx 내 provider의 위게를 변경하여 QueryClientProvider를 DialogProvider 내부로 이동해야 하는데,
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

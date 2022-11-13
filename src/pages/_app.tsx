import { SessionProvider } from 'next-auth/react';

import type { AppProps } from 'next/app';
import '@styles/globals.css';
import { SessionWithAuth } from 'type/auth';

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: SessionWithAuth;
}>) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;

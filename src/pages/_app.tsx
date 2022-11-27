import { SessionProvider } from 'next-auth/react';

import type { AppProps } from 'next/app';
import '@styles/globals.css';
import { SessionWithAuth } from 'type/auth';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: SessionWithAuth;
}>) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThirdwebProvider desiredChainId={ChainId.Mainnet}>
        <Component {...pageProps} />
      </ThirdwebProvider>
    </SessionProvider>
  );
}

export default MyApp;

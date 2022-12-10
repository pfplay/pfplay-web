import { SessionProvider } from 'next-auth/react';

import type { AppProps } from 'next/app';
import '@styles/globals.css';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import { Session } from 'next-auth';
import { Background } from '@components/ui/Background';

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThirdwebProvider desiredChainId={ChainId.Mainnet}>
        <Background />
        <Component {...pageProps} />
      </ThirdwebProvider>
    </SessionProvider>
  );
}

export default MyApp;

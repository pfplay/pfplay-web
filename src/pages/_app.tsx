import '@/styles/globals.css'

import { MantineProvider } from '@mantine/core'
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import type { AppProps } from 'next/app'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session
}>) {
  return (
    <SessionProvider session={pageProps.session}>
      <MantineProvider>
        <ThirdwebProvider desiredChainId={ChainId.Mainnet}>
          <Component {...pageProps} />
        </ThirdwebProvider>
      </MantineProvider>
    </SessionProvider>
  )
}

export default MyApp

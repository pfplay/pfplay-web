import '@/styles/globals.css'

import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import type { AppProps } from 'next/app'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

import { Background } from '@/components/ui/Background'

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session
}>) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThirdwebProvider desiredChainId={ChainId.Mainnet}>
        <Background />
        <Component {...pageProps} />
      </ThirdwebProvider>
    </SessionProvider>
  )
}

export default MyApp

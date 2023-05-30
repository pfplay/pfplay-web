import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'

import { MantineProvider } from '@mantine/core'
import { darkTheme, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import type { AppProps } from 'next/app'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, optimism, polygon } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session
}>) {
  const { chains, publicClient } = configureChains(
    [mainnet, polygon, optimism, arbitrum],
    [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID as string }), publicProvider()],
  )

  const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains,
  })

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  })

  return (
    <SessionProvider session={pageProps.session}>
      <MantineProvider>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} theme={darkTheme()} modalSize="wide">
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      </MantineProvider>
    </SessionProvider>
  )
}

export default MyApp

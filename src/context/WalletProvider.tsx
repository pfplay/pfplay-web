'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import { darkTheme, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID as string }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'pfplay',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
  chains,
});

const appInfo = {
  appName: 'pfplay',
};

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
});

const WalletProvider = ({ children }: PropsWithChildren) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={appInfo}
        modalSize={'compact'}
        theme={darkTheme()}
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WalletProvider;

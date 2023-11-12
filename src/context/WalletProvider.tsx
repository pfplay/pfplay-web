'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import {
  connectorsForWallets,
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import theme from '@/styles/theme';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID as string }), publicProvider()]
);

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const { wallets } = getDefaultWallets({
  appName: 'pfplay',
  projectId,
  chains,
});

const appInfo = {
  appName: 'pfplay',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Recommended',
    wallets: [rainbowWallet({ projectId, chains }), walletConnectWallet({ projectId, chains })],
  },
]);

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
        theme={darkTheme({
          accentColor: theme.colors.gray[700],
          accentColorForeground: theme.colors.white,
          borderRadius: 'small',
          overlayBlur: 'small',
        })}
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WalletProvider;

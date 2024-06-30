'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import { darkTheme, RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { RainbowKitProviderProps } from '@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/RainbowKitProvider';
import { WagmiProvider, http } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider appInfo={appInfo} modalSize='compact' theme={darkTheme()}>
        {mounted && children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
};

const APP_NAME = 'pfplay';

const appInfo: RainbowKitProviderProps['appInfo'] = {
  appName: APP_NAME,
};

const wagmiConfig = getDefaultConfig({
  appName: APP_NAME,
  projectId: process.env.NEXT_PUBLIC_WAGMI_PROJECT_ID as string,
  chains: [mainnet, polygon, optimism, arbitrum],
  // ssr: true,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});

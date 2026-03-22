'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import { darkTheme, RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { RainbowKitProviderProps } from '@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/RainbowKitProvider';
import { WagmiProvider, http } from 'wagmi';
import { polygon, optimism, arbitrum } from 'wagmi/chains';
import { useGlobalWalletSync } from '@/entities/wallet';

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider appInfo={appInfo} modalSize='compact' theme={darkTheme()}>
        {mounted && <SyncWallet>{children}</SyncWallet>}
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
  chains: [
    /*
     * chain을 mainnet으로 설정 시 아래 이슈에 명시된 것과 같은 에러 발생하여 임시 주석 처리
     * @see https://github.com/wevm/viem/issues/881
     * 환경 - Windows 11, Chrome, rainbowkit 확장프로그램 1.5.68, viem 라이브러리 2.21.58
     */
    // mainnet,
    polygon,
    optimism,
    arbitrum,
  ],
  ssr: true,
  transports: {
    // [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});

function SyncWallet({ children }: PropsWithChildren) {
  useGlobalWalletSync();

  return children;
}

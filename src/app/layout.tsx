import { Metadata } from 'next';
import '@rainbow-me/rainbowkit/styles.css';
import '@/styles/globals.css';
import { PropsWithChildren } from 'react';
import { DomId } from '@/constants/domId';
import { DialogProvider } from '@/context/DialogProvider';
import SessionProvider from '@/context/SessionProvider';
import WalletProvider from '@/context/WalletProvider';
import { pretendardVariable } from '@/styles/fonts';
import SessionCheck from './sessionCheck';

export const metadata: Metadata = {
  title: 'PFPlay',
  description: 'PFP Playground for music',
  icons: {
    icon: '/favicon.ico',
  },
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang='en'>
      <body className={pretendardVariable.className}>
        <SessionProvider>
          <WalletProvider>
            <SessionCheck>
              <DialogProvider>{children}</DialogProvider>
            </SessionCheck>
          </WalletProvider>
        </SessionProvider>

        <div id={DomId.TooltipRoot} />
      </body>
    </html>
  );
};

export default RootLayout;

import { Metadata } from 'next';
import '@rainbow-me/rainbowkit/styles.css';
import '@/styles/globals.css';
import { PropsWithChildren } from 'react';
import { DomId } from '@/constants/domId';
import { DialogProvider } from '@/context/DialogProvider';
import { ReactQueryProvider } from '@/context/ReactQueryProvider';
import SessionProvider from '@/context/SessionProvider';
import { pretendardVariable } from '@/styles/fonts';

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
        <ReactQueryProvider>
          <SessionProvider>
            <DialogProvider>{children}</DialogProvider>
          </SessionProvider>
        </ReactQueryProvider>

        <div id={DomId.TooltipRoot} />
      </body>
    </html>
  );
};

export default RootLayout;

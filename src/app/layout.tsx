import { Metadata } from 'next';

import '@/styles/globals.css';
import { PropsWithChildren } from 'react';
import { DomId } from '@/constants/domId';
import { DialogProvider } from '@/context/DialogProvider';
import SessionProvider from '@/context/SessionProvider';
import { pretendardVariable } from '@/styles/fonts';
import { cn } from '@/utils/cn';
import SessionCheck from './sessionCheck';

export const metadata: Metadata = {
  title: 'PFPlay',
  // TODO: description 추가, title 뒤에 설명 추가
  icons: {
    icon: '/favicon.ico',
  },
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang='en'>
      <body className={cn('min-h-screen', pretendardVariable.className)}>
        <SessionProvider>
          <SessionCheck>
            <DialogProvider>{children}</DialogProvider>
          </SessionCheck>
        </SessionProvider>

        <div id={DomId.TooltipRoot} />
      </body>
    </html>
  );
};

export default RootLayout;

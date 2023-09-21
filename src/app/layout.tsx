import React from 'react';
import '@/styles/globals.css';
import { DomId } from '@/constants/domId';
import { DialogProvider } from '@/context/DialogProvider';
import SessionProvider from '@/context/SessionProvider';
import { pretendardVariable } from '@/styles/fonts';
import { cn } from '@/utils/cn';
import SessionCheck from './sessionCheck';

const RootLayout = ({ children }: React.PropsWithChildren) => {
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

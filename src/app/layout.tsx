import React from 'react';
import '@/styles/globals.css';
import Header from '@/components/__legacy__/Header';
import { DomId } from '@/contants/domId';
import { DialogProvider } from '@/context/DialogProvider';
import SessionProvider from '@/context/SessionProvider';
import { cn } from '@/lib/utils';
import { pretendardVariable } from '@/styles/fonts';
import SessionCheck from './sessionCheck';

const RootLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <html lang='en'>
      <body className={cn('min-h-screen', pretendardVariable.className)}>
        <SessionProvider>
          <SessionCheck>
            <DialogProvider>
              {/* TODO: Header를 react-router-dom의 useMatch hook을 이용하는 것 처럼 조건부 렌더 하는 방법 찾기.  */}
              <Header />
              {children}
            </DialogProvider>
          </SessionCheck>
        </SessionProvider>

        <div id={DomId.TooltipRoot} />
      </body>
    </html>
  );
};

export default RootLayout;

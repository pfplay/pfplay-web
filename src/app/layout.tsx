import React from 'react';
import '@/styles/globals.css';

import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';
import { fontNanumGothic } from '@/lib/fonts';

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang='en'>
      <body className={cn('min-h-screen font-sans', fontNanumGothic.className)}>
        <Providers>
          {/* TODO: Header를 react-router-dom의 useMatch hook을 이용하는 것 처럼 조건부 렌더 하는 방법 찾기.  */}
          {children}
        </Providers>
      </body>
    </html>
  );
}

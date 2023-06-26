import React from 'react';
import '@/styles/globals.css';
import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';
import { fontNanumGothic } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'PFPlay',
  description: 'Generated by create next app',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang='en'>
      <body className={cn('min-h-screen font-sans', fontNanumGothic.className)}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
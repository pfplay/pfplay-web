import React from 'react';
import '@/styles/globals.css';
import Header from '@/components/Header';
import SessionProvider from '@/context/SessionProvider';

const RootLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <html lang='en'>
      <body className='min-h-screen'>
        <SessionProvider>
          {/* TODO: Header를 react-router-dom의 useMatch hook을 이용하는 것 처럼 조건부 렌더 하는 방법 찾기.  */}
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;

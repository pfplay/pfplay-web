import { Header } from '@/components/header';
import React from 'react';

export default function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}


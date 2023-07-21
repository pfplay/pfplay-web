'use client';
import { SessionProvider as _SessionProvider } from 'next-auth/react';
import React from 'react';

const SessionProvider = ({ children }: React.PropsWithChildren) => {
  return <_SessionProvider>{children} </_SessionProvider>;
};

export default SessionProvider;

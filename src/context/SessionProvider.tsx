'use client';
import { SessionProvider as _SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

const SessionProvider = ({ children }: PropsWithChildren) => {
  return <_SessionProvider>{children} </_SessionProvider>;
};

export default SessionProvider;

'use client';
import { SessionProvider as _SessionProvider } from 'next-auth/react';

const SessionProvider = ({ children }: React.PropsWithChildren) => {
  return <_SessionProvider>{children} </_SessionProvider>;
};

export default SessionProvider;

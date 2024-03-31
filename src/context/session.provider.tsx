'use client';
import { SessionProvider as _SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

/**
 * 'use client' 적용만을 위한 wrapper입니다.
 */
export const SessionProvider = ({ children }: PropsWithChildren) => {
  return <_SessionProvider>{children} </_SessionProvider>;
};

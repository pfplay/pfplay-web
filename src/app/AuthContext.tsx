'use client'

import { SessionProvider } from 'next-auth/react'

export interface IAuthContextProps {
  children: React.ReactNode
}

export default function AuthContext({ children }: IAuthContextProps) {
  return <SessionProvider>{children}</SessionProvider>
}

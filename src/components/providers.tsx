'use client'

import { MantineProvider } from '@mantine/core'
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <SessionProvider>
      <MantineProvider>
        <ThirdwebProvider desiredChainId={ChainId.Mainnet}>{children}</ThirdwebProvider>
      </MantineProvider>
    </SessionProvider>
  )
}

import Link from 'next/link'
import React from 'react'

import { EmailBox } from '../EmailBox'
import { Logo, WorldGlobe } from '../icon'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <header className="absolute top-[44px] w-[100%] text-white flex justify-between items-center px-[120px]">
        <Link href="/" passHref>
          <Logo />
        </Link>
        <div className="flex items-center">
          <EmailBox />
          <WorldGlobe />
        </div>
      </header>
      <main className="w-[100vw] h-[100vh] bg-black ">{children}</main>
    </div>
  )
}

export default RootLayout

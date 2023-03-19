import Link from 'next/link'
import React from 'react'

import { EmailBox } from '../EmailBox'
import { Logo, WorldGlobe } from '../icon'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <header className="absolute top-11 w-full h-ull text-white flex justify-between items-center px-[120px] z-10">
        <Link href="/" passHref>
          <Logo />
        </Link>
        <div className="flex items-center">
          <EmailBox />
          <WorldGlobe />
        </div>
      </header>
      <main className="w-full h-full bg-black pt-[160px] pb-[120px]">{children}</main>
    </div>
  )
}

export default RootLayout

'use client'
import Link from 'next/link'
import React from 'react'

import { Logo, WorldGlobe } from '@/components/ui/icon'

import { EmailBox } from '../ui/EmailBox'

export const Layout = ({ children }: { children: React.ReactNode }) => {
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
      <main className="w-[100vw] h-[100vh] bg-onboarding bg-cover">{children}</main>
    </div>
  )
}

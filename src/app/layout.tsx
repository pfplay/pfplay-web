import '../styles/globals.css'

import Head from 'next/head'
import Link from 'next/link'

import { EmailBox } from '@/components/ui/EmailBox'
import { Logo, WorldGlobe } from '@/components/ui/icon'

import AuthContext from './AuthContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext>
      <html lang="ko">
        <Head>
          <title>PFPLAY</title>
          <meta name="description" content="Let your PFP Play" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body className="w-[100%] h-[100%] bg-black px-[120px] pt-[40px]">
          <header>
            <div className="w-[100%] text-white flex justify-between items-center">
              <Link href="/" passHref>
                <Logo />
              </Link>
              <div className="flex items-center">
                <EmailBox />
                <WorldGlobe />
              </div>
            </div>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </AuthContext>
  )
}

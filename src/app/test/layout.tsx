import Head from 'next/head'

import SideBar from '@/components/ui/SideBar'

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>PFPLAY</title>
        <meta name="description" content="Let your PFP Play" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SideBar />
      <main>{children}</main>
    </>
  )
}

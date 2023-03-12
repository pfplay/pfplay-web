import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { ChevronRight } from '@/components/ui/icon/ChevronRight'

const Home: NextPage = () => {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>PFPlay</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex justify-center items-center text-white h-full">
        <div className="flex flex-col text-center">
          <Image
            className="mb-[72px]"
            src="/logos/wordmark_medium_white.svg"
            width={300}
            height={72}
            alt="PFPlay"
          />
          <button>
            <Link href={!session ? './login' : './profile/edit'}>
              <p className="text-xl font-bold text-white py-3 px-24 bg-gradient-to-r from-[#780808] to-[#AE001F] rounded">
                Let your PFP Play
              </p>
            </Link>
          </button>
        </div>
        <div className="w-full absolute bottom-[66px] flex justify-between text-white px-[120px]">
          <p className="text-[#707070] font-poppins">Privacy&Terms</p>
          <p className="text-[#dadada] flex items-center space-x-2">
            <span>당신의 PFP는 안녕한가요?</span>
            <ChevronRight />
          </p>
        </div>
      </div>
    </>
  )
}
export default Home

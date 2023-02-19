import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const Home: NextPage = () => {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* 진입 화면 코드 */}
      <div className="flex justify-between h-screen text-white">
        <div className="flex flex-col-reverse ">
          <p className="ml-14 mb-5 font-semibold underline underline-offset-4 text-sm cursor-pointer">
            Privacy&Terms
          </p>
        </div>
        <div className="flex flex-col text-center my-auto pr-14">
          <Image
            className="mb-[72px]"
            src="/logos/wordmark_medium_white.svg"
            width={297.24}
            height={72}
            alt="logo"
          />
          <button>
            {/* TODO: 백엔드에서 프로필 정보가 없을 때만 profile/edit으로 이동 */}
            <Link href={!session ? './login' : './profile/edit'}>
              <p className="text-xl font-extrabold border-none border-2 rounded-full bg-red-800 text-white py-4 px-16">
                Let your PFP Play
              </p>
            </Link>
          </button>
        </div>
        <div className="flex flex-col">
          <div className="ml-12 mr-4 mt-4 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-10 h-10">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  )
}
export default Home

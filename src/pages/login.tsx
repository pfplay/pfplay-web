import type { NextPage } from 'next'
import Image from 'next/future/image'
import Head from 'next/head'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useCallback, useState } from 'react'

import { NotificationModal } from '@/components/modal/NotificationModal'

const Login: NextPage = () => {
  const [isOpen, setIsOpen] = useState(false)
  const handleOpenModal = useCallback(() => {
    setIsOpen(true)
  }, [])
  const handleCloseModal = useCallback(() => {
    setIsOpen(false)
  }, [])
  const signInGoogle = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div>
      <NotificationModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title={'잠깐만요!'}
        content={
          '비로그인 입장 시 접근 가능한 기능이 제한됩니다 구글 계정을 연동하면 온전한 서비스를 즐길 수 있어요'
        }
        cancelTitle={'비로그인 입장하기'}
        okTitle={'구글 연동하기'}
        onOk={signInGoogle}
      />
      <Head>
        <title>DEV-PFPLAY</title>
        <meta name="description" content="Your Space" />
      </Head>

      {/* 백그라운드 적용을 위한 코드 */}
      <div
        className=" bg-black fixed w-screen h-screen"
        style={{
          zIndex: -1,
        }}>
        <Image src="/image/Onboard.png" alt="Onboard" fill />
      </div>

      {/* 로그인 화면 코드 */}
      <div className="flex justify-between h-screen text-white">
        <div className="ml-4 mt-5">
          <Link href="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 cursor-pointer">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
        </div>
        <div className="flex flex-col text-center my-auto">
          <h1 className="text-4xl font-extrabold mb-10 mt-10 tracking-wide">PFPlay</h1>
          <button
            className="text-xl border-solid border-2 rounded-full  py-4 w-72 pr-8 font-extrabold flex justify-center border-gray-500 "
            onClick={signInGoogle}>
            <Image
              className="mr-4 ml-4"
              src="/icons/google.png"
              alt="google login"
              width={28}
              height={28}
            />
            <p>Sign in With Google</p>
          </button>
          <p className="font-semibold mt-8">OR</p>
          <span className="flex justify-center">
            <button
              className="underline underline-offset-8 font-semibold mt-8 cursor-pointer w-36 "
              onClick={handleOpenModal}>
              먼저 둘러볼래요
            </button>
          </span>
        </div>

        <div className="flex flex-col">
          <div className="mr-4 mt-4 cursor-pointer">
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
    </div>
  )
}

export default Login

import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
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
      {/* 로그인 화면 코드 */}
      <div className="flex justify-center items-center text-white h-screen">
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
      </div>
    </div>
  )
}

export default Login

'use client';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { NotificationModal } from '../modal/NotificationModal';

export const OAuthLogIn = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  // TODO: set main stage party room number
  const signInAnnonynmous = () => {
    router.push('/party/1');
  };
  const signInGoogle = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <>
      <div className='flex justify-center items-center text-white h-screen relative'>
        <div className='flex flex-col items-center w-[640px] backdrop-blur-lg relative border border-[#1c1c1c] bg-[#180202]/50'>
          <Link href='/' className='absolute right-10 top-10'>
            <Image src='/icons/icn_close.svg' alt='close' width={20} height={20} />
          </Link>
          <div className='w-full py-[70px] flex flex-col justify-center items-center'>
            <Image
              className='mb-[68px]'
              src='/logos/wordmark_medium_white.svg'
              width={115.59}
              height={28}
              alt='logo'
            />
            <button
              className='inline-flex items-center w-80 py-3 pl-5 border border-neutral-500 rounded mb-10'
              onClick={signInGoogle}
            >
              <Image src='/icons/google.png' alt='google login' width={32} height={32} />
              <p className='ml-3 font-poppins'>Sign in With Google</p>
            </button>
            <span className='flex justify-center'>
              <button
                className='text-sm text-neutral-300 cursor-pointer border-b'
                onClick={handleOpenModal}
              >
                먼저 둘러볼래요
              </button>
            </span>
          </div>
        </div>
      </div>
      <NotificationModal
        isOpen={isOpen}
        onClose={signInAnnonynmous}
        title={'잠깐만요!'}
        content={
          '비로그인 입장 시 접근 가능한 기능이 제한됩니다 구글 계정을 연동하면 온전한 서비스를 즐길 수 있어요'
        }
        cancelTitle={'비로그인 입장하기'}
        okTitle={'구글 연동하기'}
        onOk={signInGoogle}
      />
    </>
  );
};
